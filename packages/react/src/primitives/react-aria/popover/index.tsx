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
  type CheckAnimation,
} from '../../../utils/motion';
import {
  asMotion,
  mergeRefs,
  useAnchoredMotion,
  type AnchoredAnimationProps,
} from '../../../internal/anchored';
import {
  CheckRegistryContext,
  usePickHold,
  PickContext,
  usePicks,
  type Picked,
} from '../../../internal/item-indicator';
import { originFor } from './origin';

type PopoverProps = PopoverPrimitiveProps & AnchoredAnimationProps;

const MENU_TRIGGERS = new Set([
  'MenuTrigger',
  'SubmenuTrigger',
  'Select',
  'ComboBox',
]);

type PopoverContextValue = PopoverPrimitiveProps | null | undefined;

const FOCUS_TARGET = '[role=menu],[role=listbox],[role=dialog]';

type LivePopoverProps = PopoverPrimitiveProps &
  React.RefAttributes<HTMLElement>;

const LivePropsContext = React.createContext<LivePopoverProps | null>(null);

type ListTriggerState = {
  selectionManager?: {
    selectionMode: string;
    selectedKeys: 'all' | Iterable<string | number>;
  };
};

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
  const reduce = useShouldReduceMotion();
  const parentPicks = React.use(PickContext);
  const { picks, registerCheck, wasPicked } = usePicks();
  const menuPicks = React.useMemo(
    () => ({
      markPick: (look: CheckAnimation) => {
        picks.markPick(look);
        parentPicks?.markPick(look);
      },
      hasCheck: picks.hasCheck,
      checkOf: picks.checkOf,
    }),
    [picks, parentPicks],
  );
  const [menuPicked, setMenuPicked] = React.useState<Picked>(false);
  if (openChanged) setMenuPicked(!open && wasPicked());
  const popoverProps = {
    ...props,
    ref,
    ...(local && { isOpen: open, defaultOpen: undefined, onOpenChange }),
  };

  return (
    <ReducedMotionConfig>
      <PickContext value={menuPicks}>
        <CheckRegistryContext value={registerCheck}>
          <LivePropsContext value={popoverProps}>
            <AnimatePresence
              custom={reduce ? false : menuPicked || (picked && 'list')}
            >
              {open && (
                <AnimatedPopover
                  key="popover"
                  popoverProps={popoverProps}
                  transition={transition}
                  exitTransition={exitTransition}
                  checkOf={picks.checkOf}
                />
              )}
            </AnimatePresence>
          </LivePropsContext>
        </CheckRegistryContext>
      </PickContext>
      {!open && <PopoverPrimitive {...popoverProps} />}
    </ReducedMotionConfig>
  );
}

type AnimatedPopoverProps = AnchoredAnimationProps & {
  popoverProps: LivePopoverProps;
  checkOf: () => Picked;
};

function AnimatedPopover({
  popoverProps,
  transition,
  exitTransition,
  checkOf,
}: AnimatedPopoverProps) {
  const { render, isExiting, ...props } =
    React.use(LivePropsContext) ?? popoverProps;
  const isPresent = useIsPresent();
  const context = useSlottedContext(
    PopoverContext,
    props.slot,
  ) as PopoverContextValue;
  const trigger = props.trigger ?? context?.trigger;
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const wasPresentRef = React.useRef(isPresent);
  React.useEffect(() => {
    const returned = isPresent && !wasPresentRef.current;
    wasPresentRef.current = isPresent;
    const node = nodeRef.current;
    if (
      !returned ||
      !node ||
      trigger === 'ComboBox' ||
      node.contains(document.activeElement)
    )
      return;
    const target = node.matches(FOCUS_TARGET)
      ? node
      : (node.querySelector<HTMLElement>(FOCUS_TARGET) ?? node);
    target.focus({ preventScroll: true });
  }, [isPresent, trigger]);
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
  const hold = usePickHold();
  const variants = {
    exit: (held: Picked | 'list' | undefined) => {
      const look = held === 'list' ? checkOf() : held;
      if (!look) return exit;
      const leave = exit.transition as { delay?: number } | undefined;
      return {
        ...exit,
        transition: { ...leave, delay: (leave?.delay ?? 0) + hold(look) },
      };
    },
  };

  return (
    <PopoverPrimitive
      {...props}
      isExiting={isExiting || !isPresent}
      render={(domProps, values) => {
        const elementProps = {
          ...motionProps,
          ref: mergeRefs(
            (domProps as { ref?: React.Ref<HTMLElement> }).ref,
            nodeRef,
          ),
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
