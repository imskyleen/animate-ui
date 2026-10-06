'use client';

import * as React from 'react';
import {
  OverlayTriggerStateContext,
  Popover as PopoverPrimitive,
  PopoverContext,
  useSlottedContext,
  type PopoverProps as PopoverPrimitiveProps,
} from 'react-aria-components';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  asMotion,
  useAnchoredMotion,
  type AnchoredAnimationProps,
} from '../../../internal/anchored';
import {
  CheckRegistryContext,
  PICK_HOLD,
  PickContext,
  usePicks,
} from '../../../internal/item-indicator';
import { originFor } from './origin';

// Same API as React Aria's Popover, the overlay under DialogTrigger,
// PreviewTrigger (hover cards), MenuTrigger and SubmenuTrigger, Select,
// ComboBox and DatePicker. React Aria has no Animate UI v1 counterpart, so it
// moves like the matching Radix and Base UI overlay:
// - under menus, submenus, selects and comboboxes, like the menus: a 250ms
//   fade and scale from 0.9, both ways;
// - anywhere else (dialogs, hover cards, date pickers), like the popovers: it
//   grows from 0.8 and fades in from the trigger on a spring, and shrinks
//   back the same way.
//
// React Aria keeps a popover mounted while it exits only if it sees running
// animations when it closes, before Motion has started any. So the Popover
// gates itself with AnimatePresence on the open state (the same one React Aria
// reads) and passes `isExiting` while the exit plays.
//
// Under a Select or a ComboBox with a single selection, choosing another item
// closes the list: when a check (a SelectionIndicator) is there to glide, it
// holds still for 150ms first, so the check is seen landing on the item.
// Under a menu, likewise when the item chosen closes the menu while its check
// moves (Animate UI's MenuItem tells it); the menus around a submenu hold
// with it.

type PopoverProps = PopoverPrimitiveProps & AnchoredAnimationProps;

/** The overlays of a list: they move like v1's DropdownMenu content. */
const MENU_TRIGGERS = new Set([
  'MenuTrigger',
  'SubmenuTrigger',
  'Select',
  'ComboBox',
]);

type PopoverContextValue = PopoverPrimitiveProps | null | undefined;

type LivePopoverProps = PopoverPrimitiveProps &
  React.RefAttributes<HTMLElement>;

/**
 * The Popover's latest props, for the leaving popover: AnimatePresence keeps
 * the element it last rendered, but what's inside goes on updating (a menu's
 * selection changes as the menu closes, and its check glides there).
 */
const LivePropsContext = React.createContext<LivePopoverProps | null>(null);

/** The selection of a Select's or a ComboBox's state (both are lists). */
type ListTriggerState = {
  selectionManager?: {
    selectionMode: string;
    selectedKeys: 'all' | Iterable<string | number>;
  };
};

/** The trigger's selection, comparable from one render to the next. */
function selectionOf(state: ListTriggerState | null) {
  const keys = state?.selectionManager?.selectedKeys;
  if (keys === undefined || keys === 'all') return keys;
  return [...keys].join('\u0000');
}

function Popover({
  transition,
  exitTransition,
  ref,
  ...props
}: PopoverProps & React.RefAttributes<HTMLElement>) {
  const context = useSlottedContext(
    PopoverContext,
    props.slot,
  ) as PopoverContextValue;
  const triggerState = React.use(OverlayTriggerStateContext);

  // Same rule as React Aria: its own state when controlled, uncontrolled or
  // standalone; otherwise the trigger's (DialogTrigger, Select, MenuTrigger…).
  const isOpenProp = props.isOpen ?? context?.isOpen;
  const defaultOpen = props.defaultOpen ?? context?.defaultOpen;
  const local = isOpenProp != null || defaultOpen != null || !triggerState;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = local
    ? (isOpenProp ?? uncontrolled)
    : (triggerState?.isOpen ?? false);

  const onOpenChange = (next: boolean) => {
    if (isOpenProp == null) setUncontrolled(next);
    props.onOpenChange?.(next);
  };

  // Closed with another single selection than it opened with: an item was
  // chosen, whose check shows itself.
  const list = triggerState as ListTriggerState | null;
  const selection = selectionOf(list);
  const [openedWith, setOpenedWith] = React.useState(selection);
  const [wasOpen, setWasOpen] = React.useState(open);
  const openChanged = wasOpen !== open;
  if (openChanged) {
    setWasOpen(open);
    if (open) setOpenedWith(selection);
  }
  const picked =
    !open &&
    list?.selectionManager?.selectionMode === 'single' &&
    selection !== openedWith;
  // Nothing moves under reduced motion: nothing to wait for.
  const reduce = useShouldReduceMotion();
  // The SelectionIndicators of its ListBox or Menu register: no check, no
  // hold. A menu's items mark their picks, for it and the menus around.
  const parentPicks = React.use(PickContext);
  const { picks, registerCheck, wasPicked } = usePicks();
  const menuPicks = React.useMemo(
    () => ({
      markPick: () => {
        picks.markPick();
        parentPicks?.markPick();
      },
      hasCheck: picks.hasCheck,
    }),
    [picks, parentPicks],
  );
  // Read as it closes: a menu item was just chosen.
  const [menuPicked, setMenuPicked] = React.useState(false);
  if (openChanged) setMenuPicked(!open && wasPicked());
  const popoverProps = {
    ...props,
    ref,
    // Its own state: handed back to React Aria, one source of truth.
    ...(local && { isOpen: open, defaultOpen: undefined, onOpenChange }),
  };

  return (
    <ReducedMotionConfig>
      <PickContext value={menuPicks}>
        <CheckRegistryContext value={registerCheck}>
          {/* `custom` reaches the leaving popover: whether to hold still. */}
          <LivePropsContext value={popoverProps}>
            <AnimatePresence
              custom={reduce ? false : menuPicked ? 'menu' : picked && 'list'}
            >
              {open && (
                <AnimatedPopover
                  key="popover"
                  popoverProps={popoverProps}
                  transition={transition}
                  exitTransition={exitTransition}
                  hasCheck={picks.hasCheck}
                />
              )}
            </AnimatePresence>
          </LivePropsContext>
        </CheckRegistryContext>
      </PickContext>
      {/* Closed, React Aria's Popover renders nothing, except in a
          collection's hidden tree: Select and ComboBox build their items
          from it. */}
      {!open && <PopoverPrimitive {...popoverProps} />}
    </ReducedMotionConfig>
  );
}

type AnimatedPopoverProps = AnchoredAnimationProps & {
  popoverProps: LivePopoverProps;
  /** Whether its list shows a check, read when it leaves. */
  hasCheck: () => boolean;
};

function AnimatedPopover({
  popoverProps,
  transition,
  exitTransition,
  hasCheck,
}: AnimatedPopoverProps) {
  // Leaving, it still gets the latest props.
  const { render, isExiting, ...props } =
    React.use(LivePropsContext) ?? popoverProps;
  const isPresent = useIsPresent();
  const context = useSlottedContext(
    PopoverContext,
    props.slot,
  ) as PopoverContextValue;
  const trigger = props.trigger ?? context?.trigger;
  // PreviewTrigger skips both when swapping between previews during warmup.
  const skip = Boolean(
    props.shouldSkipAnimation ?? context?.shouldSkipAnimation,
  );
  const { exit, ...motionProps } = useAnchoredMotion({
    kind: trigger && MENU_TRIGGERS.has(trigger) ? 'menu' : 'popover',
    open: true,
    instant: skip,
    transition,
    exitTransition,
  });
  const { delay: hold = 0 } = useTempoTransition({ delay: PICK_HOLD });
  // A variant, so the leaving popover reads AnimatePresence's `custom`: what
  // was just chosen. A list's choice is resolved as it leaves, once the
  // chosen item's check has mounted; a menu item knew when it was chosen.
  const variants = {
    exit: (held: 'menu' | 'list' | false | undefined) => {
      if (!held || (held === 'list' && !hasCheck())) return exit;
      const leave = exit.transition as { delay?: number } | undefined;
      return {
        ...exit,
        transition: { ...leave, delay: (leave?.delay ?? 0) + hold },
      };
    },
  };

  return (
    <PopoverPrimitive
      {...props}
      // Mounted until the exit is over, like React Aria's CSS animations.
      isExiting={isExiting || !isPresent}
      // React Aria's render prop: its props (resolved className and style,
      // data-placement, data-trigger, role, ref…) land on the motion element.
      render={(domProps, values) => {
        const elementProps = {
          ...motionProps,
          exit: 'exit',
          variants,
          style: {
            transformOrigin: originFor(values.placement),
            ...domProps.style,
            ...motionProps.style,
          },
        };
        return render ? (
          asMotion(render(domProps, values), elementProps)
        ) : (
          <motion.div
            {...(domProps as Record<string, unknown>)}
            {...elementProps}
          />
        );
      }}
    />
  );
}

export { Popover, type PopoverProps };
