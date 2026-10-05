'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import {
  motion,
  PresenceContext,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

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
  CHECK_TRANSITION,
  CheckRegistryContext,
  GLIDE_TRANSITION,
  PICK_HOLD,
  useCheckRegistry,
  useRegisterCheck,
} from '../../../internal/item-indicator';

// Shared by Base UI's Select and Combobox: both keep their popup mounted
// while an `actionsRef` is set, until `actionsRef.current.unmount()`.
//
// Neither has an Animate UI v1 counterpart: they move like v1's Base UI Menu.
// The popup fades and scales from 0.9 in 250ms, both ways; a highlight
// glides behind the highlighted item; a single selection's check glides to
// the chosen item on a quick spring, and a multiple selection's check
// pops in from half its size like v1's checkbox indicator. Choosing another
// item closes the list after a 150ms hold, so the check is seen landing
// (internal/item-indicator).

/** What a Root shares with its animated parts. */
type RootMotion = {
  /** Unmounts the popup: called once its exit has played. */
  unmount: () => void;
  multiple: boolean;
  /** The popup closed because an item was chosen, with a check to glide. */
  picked: boolean;
  /** Lets a shown check register with the list. */
  registerCheck: () => () => void;
};

/** What the Root needs to know of Base UI's change details. */
type OpenChangeDetails = { reason: string; isCanceled: boolean };

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

/** Animate UI's addition to `ItemIndicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check moving to the chosen item (single selection), or
   * popping in (multiple selection). Defaults to a spring (stiffness 500,
   * damping 40), and Motion's defaults for the pop, as v1's checkbox
   * indicator.
   */
  transition?: Transition;
};

/** The checks of an open list share it: the check glides to the chosen item. */
const IndicatorLayoutContext = React.createContext<string | null>(null);

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
    // A check is shown (the chosen one isn't mounted yet): it will glide.
    setPicked(!open && eventDetails.reason === 'item-press' && hasCheck());
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
  // Closing because an item was chosen: the list holds still while the check
  // glides there (it doesn't glide under reduced motion).
  const exitDelay = (exit as { delay?: number }).delay ?? 0;
  const held: Transition =
    root?.picked && !reduce ? { ...exit, delay: exitDelay + hold } : exit;
  const layoutId = React.useId();
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
        <IndicatorLayoutContext value={layoutId}>
          <CheckRegistryContext value={root?.registerCheck ?? null}>
            <HighlightScope open={open}>{children}</HighlightScope>
          </CheckRegistryContext>
        </IndicatorLayoutContext>
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
  /** Multiple selection pops each check in; a single one glides. */
  multiple: boolean;
};

/**
 * A check, keeping the element the user's `render` asks for. Single
 * selection: it shows with the list and glides to the chosen item, while the
 * list holds still before it closes. Multiple selection: it pops in from half
 * its size and fades in when the item is selected, and goes at once when it's
 * deselected.
 */
function IndicatorMotion({
  render,
  props,
  state,
  multiple,
  transition,
}: IndicatorMotionProps) {
  const reduce = useShouldReduceMotion();
  const layoutId = React.use(IndicatorLayoutContext);
  // A single selection's shown check: choosing another item holds the list.
  useRegisterCheck(!multiple && state.selected);
  const check = useTempoTransition(transition ?? CHECK_TRANSITION);
  const glide = useTempoTransition(transition ?? GLIDE_TRANSITION);

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
    // A component can't become a motion element: render it unanimated.
    if (typeof render.type !== 'string')
      return React.cloneElement(render, merged);
    type = render.type;
    elementProps = merged;
  }

  const Element = motion[type as 'span'];
  const motionProps = elementProps as HTMLMotionProps<'span'>;

  if (!multiple) {
    return (
      // Out of the list's exit: the list doesn't wait for the glide to end
      // before it unmounts.
      <PresenceContext value={null}>
        <Element
          {...motionProps}
          layoutId={layoutId ?? undefined}
          // One check moving, not two crossfading.
          layoutCrossfade={false}
          transition={glide}
          style={{
            ...motionProps.style,
            ...(state.selected ? null : { visibility: 'hidden' as const }),
          }}
        />
      </PresenceContext>
    );
  }
  return (
    <Element
      {...motionProps}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
      animate={
        state.selected
          ? { opacity: 1, scale: 1, transition: check }
          : // Deselected: gone at once (kept mounted, or while Base UI unmounts it).
            { opacity: 0, transition: { duration: 0 } }
      }
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
