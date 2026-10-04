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

// Shared by Base UI's Select and Combobox: both keep their popup mounted
// while an `actionsRef` is set, until `actionsRef.current.unmount()`.
//
// Neither has an Animate UI v1 counterpart: they move like v1's Base UI Menu.
// The popup fades and scales from 0.9 in 200ms, both ways; a highlight
// glides behind the highlighted item; a single selection's check glides to
// the chosen item like v1's radio indicator, and a multiple selection's check
// pops in from half its size like v1's checkbox indicator.

/** What a Root shares with its animated parts. */
type RootMotion = {
  /** Unmounts the popup: called once its exit has played. */
  unmount: () => void;
  multiple: boolean;
};

/** Animate UI's additions to `Popup`. */
type PopupAnimationProps = {
  /**
   * Transition of the opening, and of the closing unless `exitTransition` is
   * set. Defaults to `{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }`.
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

/** Animate UI's addition to `ItemIndicator`. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check moving to the chosen item (single selection), or
   * popping in (multiple selection). Defaults to Motion's defaults, as v1's
   * radio and checkbox indicators.
   */
  transition?: Transition;
};

/** The checks of an open list share it: the check glides to the chosen item. */
const IndicatorLayoutContext = React.createContext<string | null>(null);

/** Keeps the actions Base UI needs, and forwards the user's `actionsRef`. */
function useRootMotion<Actions extends { unmount: () => void }>(
  actionsRef: React.RefObject<Actions | null> | undefined,
  multiple: boolean,
) {
  const internalRef = React.useRef<Actions | null>(null);
  React.useImperativeHandle(
    actionsRef,
    () => ({ unmount: () => internalRef.current?.unmount() }) as Actions,
    [],
  );
  const unmount = React.useCallback(() => internalRef.current?.unmount(), []);
  const context = React.useMemo<RootMotion>(
    () => ({ unmount, multiple }),
    [unmount, multiple],
  );
  return [internalRef, context] as const;
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
            : { ...hidden, transition: exit }
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
          <HighlightScope open={open}>{children}</HighlightScope>
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

/** Motion's defaults, which v1's checkbox check used: written out for the tempo. */
const CHECK_TRANSITION = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as const satisfies Transition;
/** Motion's default layout transition, which v1's radio indicator used. */
const GLIDE_TRANSITION = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1],
} as const satisfies Transition;

/**
 * A check, keeping the element the user's `render` asks for. Single
 * selection: it shows with the list and glides to the chosen item (while the
 * list closes). Multiple selection: it pops in from half its size and fades
 * in when the item is selected, and goes at once when it's deselected.
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
