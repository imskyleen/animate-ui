'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import {
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import {
  HIDDEN_SCALE,
  MENU_TRANSITION,
  mergeRefs,
} from '../../../internal/anchored';
import {
  HighlightScope,
  useItemHighlight,
  withHighlight,
} from '../../../internal/item-highlight';
import {
  CheckRegistryContext,
  ItemCheck,
  PICK_HOLD,
  useCheckGroup,
  useCheckRegistry,
  type CheckGroup,
  type ItemCheckAnimationProps,
} from '../../../internal/item-indicator';

// Shared by Base UI's Select and Combobox: both keep their popup mounted
// while an `actionsRef` is set, until `actionsRef.current.unmount()`.
//
// Neither has an Animate UI v1 counterpart: they move like v1's Base UI Menu.
// The popup fades and scales from 0.9 in 250ms, both ways; a highlight
// glides behind the highlighted item; an item's check draws itself when the
// item is chosen and erases itself when it's not anymore, like a checkbox's
// (with `pop`, it pops in and out, and a single selection's check glides to
// the chosen item on a quick spring). Choosing another item closes the list
// after a 150ms hold, so the change is seen (internal/item-indicator).

/** What a Root shares with its animated parts. */
type RootMotion = {
  /** Unmounts the popup: called once its exit has played. */
  unmount: () => void;
  multiple: boolean;
  /** The popup closed because an item was chosen, whose check changes. */
  picked: boolean;
  /** Lets a check register with the list. */
  registerCheck: (element: Element) => () => void;
};

/** What the Root needs to know of Base UI's change details. */
type OpenChangeDetails = {
  reason: string;
  isCanceled: boolean;
  event?: Event;
};

/** Animate UI's additions to `Popup`. */
type PopupAnimationProps = {
  /**
   * Transition of the opening, and of the closing unless `exitTransition` is
   * set. Defaults to `{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }`.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's additions to `ItemIndicator`. */
type IndicatorAnimationProps = ItemCheckAnimationProps;

/**
 * The checks of an open list share it: a single selection's check glides to
 * the chosen item (`pop`).
 */
const IndicatorGroupContext = React.createContext<CheckGroup | null>(null);

/**
 * Whether a press closing the list chose an item whose check changes:
 * another item than the chosen one (the DOM still shows the old state), with
 * a check.
 */
function checkChanges(
  details: OpenChangeDetails,
  hasCheck: (item: Element) => boolean,
) {
  if (details.reason !== 'item-press') return false;
  const target = details.event?.target;
  const item =
    target instanceof Element ? target.closest('[role="option"]') : null;
  return (
    item !== null &&
    item.getAttribute('aria-selected') !== 'true' &&
    hasCheck(item)
  );
}

/**
 * Keeps the actions Base UI needs, and forwards the user's `actionsRef`.
 * Returns the Root's `onOpenChange` too: it notes whether the popup closed
 * because an item was chosen.
 */
function useRootMotion<
  Actions extends { unmount: () => void },
  Details extends OpenChangeDetails,
>(
  actionsRef: React.RefObject<Actions | null> | undefined,
  multiple: boolean,
  onOpenChange: ((open: boolean, eventDetails: Details) => void) | undefined,
) {
  const internalRef = React.useRef<Actions | null>(null);
  React.useImperativeHandle(
    actionsRef,
    () => ({ unmount: () => internalRef.current?.unmount() }) as Actions,
    [],
  );
  const unmount = React.useCallback(() => internalRef.current?.unmount(), []);
  const { registerCheck, hasCheck } = useCheckRegistry();
  const [picked, setPicked] = React.useState(false);
  const handleOpenChange = (open: boolean, eventDetails: Details) => {
    onOpenChange?.(open, eventDetails);
    if (eventDetails.isCanceled) return;
    // The chosen item's check shows itself while the list holds.
    setPicked(!open && checkChanges(eventDetails, hasCheck));
  };
  const context = React.useMemo<RootMotion>(
    () => ({ unmount, multiple, picked, registerCheck }),
    [unmount, multiple, picked, registerCheck],
  );
  return [internalRef, context, handleOpenChange] as const;
}

type PopupRenderProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

/**
 * The `render` of a Popup: a motion.div that scales and fades in from
 * `--transform-origin`, plays its exit while Base UI keeps it mounted, then
 * unmounts it. Call it inside ReducedMotionConfig.
 */
function usePopupRender(
  root: RootMotion | null,
  { transition, exitTransition }: PopupAnimationProps,
) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? MENU_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? MENU_TRANSITION,
  );
  const { delay: hold = 0 } = useTempoTransition({ delay: PICK_HOLD });
  // Closing because an item was chosen: the list holds still while its check
  // shows itself (nothing moves under reduced motion).
  const exitDelay = (exit as { delay?: number }).delay ?? 0;
  const held: Transition =
    root?.picked && !reduce ? { ...exit, delay: exitDelay + hold } : exit;
  const group = useCheckGroup();
  // Base UI can mount a closed popup (typeahead and autofill on the closed
  // trigger register the items): only an exit that followed an entrance
  // unmounts it.
  const shownRef = React.useRef(false);

  return (
    { children, ...renderProps }: PopupRenderProps,
    state: { open: boolean; side: string },
  ) => {
    const { open } = state;
    // Align-with-trigger (side "none") lays the list over the trigger like a
    // native select, lined up on the selected item: fade only.
    const aligned = state.side === 'none';
    // `scale` (like v1's menus): `transform: none` once settled.
    const hidden = aligned
      ? { opacity: 0 }
      : { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE.menu };
    const visible = aligned ? { opacity: 1 } : { opacity: 1, scale: 1 };

    return (
      // Base UI's props (className, style, data-open, data-side, role, ids,
      // handlers…) land on the motion.div; it adds only the animation.
      <motion.div
        {...(renderProps as HTMLMotionProps<'div'>)}
        initial={hidden}
        // The same element stays mounted while it closes, so reopening it
        // mid-exit retargets from where it is.
        animate={
          open
            ? { ...visible, transition: enter }
            : { ...hidden, transition: held }
        }
        onAnimationStart={() => {
          if (open) shownRef.current = true;
        }}
        // Base UI reports the end of the entrance itself (it waits for the
        // element's animations); the end of the exit is ours to report.
        onAnimationComplete={() => {
          if (open || !shownRef.current) return;
          shownRef.current = false;
          root?.unmount();
        }}
        style={{
          ...renderProps.style,
          transformOrigin: aligned ? undefined : 'var(--transform-origin)',
          // The highlight goes under the items' content, above the list's
          // background: the list is its own stacking context.
          isolation: 'isolate',
        }}
      >
        <IndicatorGroupContext value={group}>
          <CheckRegistryContext value={root?.registerCheck ?? null}>
            <HighlightScope open={open}>{children}</HighlightScope>
          </CheckRegistryContext>
        </IndicatorGroupContext>
      </motion.div>
    );
  };
}

type ItemProps = {
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/** An item that takes part in the list's highlight. */
function useHighlightedItem<P extends ItemProps>({
  disabled,
  children,
  ref,
  ...props
}: P) {
  const { ref: highlightRef, highlight } = useItemHighlight(disabled);
  const mergedRef = React.useMemo(
    () => mergeRefs(ref, highlightRef),
    [ref, highlightRef],
  );
  return {
    ...props,
    disabled,
    ref: mergedRef,
    children: withHighlight(children, highlight),
  };
}

type IndicatorRender =
  | React.ReactElement<Record<string, unknown>>
  | ((props: never, state: never) => React.ReactElement)
  | undefined;

type IndicatorMotionProps = IndicatorAnimationProps & {
  render: IndicatorRender;
  props: Record<string, unknown>;
  state: { selected: boolean };
  /** Each check of a multiple selection shows on its own. */
  multiple: boolean;
};

/**
 * A check, keeping the element the user's `render` asks for, kept mounted
 * (the parts pass `keepMounted`): it shows itself when its item is selected
 * and hides itself when it's deselected, while a closing list holds still;
 * the list opening shows it at rest. With `pop`, a single selection's check
 * glides to the chosen item.
 */
function IndicatorMotion({
  render,
  props,
  state,
  multiple,
  animation,
  transition,
}: IndicatorMotionProps) {
  const group = React.use(IndicatorGroupContext);

  // Resolve the user's render like Base UI does, to keep their element.
  let type = 'span';
  let elementProps = props;
  if (typeof render === 'function') {
    const element = (
      render as (p: unknown, s: unknown) => React.ReactElement | null
    )(props, state);
    if (!React.isValidElement(element) || typeof element.type !== 'string')
      return element;
    type = element.type;
    elementProps = element.props as Record<string, unknown>;
  } else if (React.isValidElement(render)) {
    const merged = {
      ...mergeProps(props, render.props as Record<string, unknown>),
      ref: props.ref,
    };
    // A component's element can't be reached: render it unanimated.
    if (typeof render.type !== 'string')
      return React.cloneElement(render, merged);
    type = render.type;
    elementProps = merged;
  }

  return (
    <ItemCheck
      {...(elementProps as React.ComponentProps<'span'>)}
      as={type === 'div' ? 'div' : 'span'}
      multiple={multiple}
      group={multiple ? null : group}
      checked={state.selected}
      animation={animation}
      transition={transition}
    />
  );
}

export {
  useRootMotion,
  usePopupRender,
  useHighlightedItem,
  IndicatorMotion,
  type RootMotion,
  type PopupAnimationProps,
  type IndicatorAnimationProps,
  type IndicatorRender,
};
