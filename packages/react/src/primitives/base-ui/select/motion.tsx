'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../../utils/motion';

// Shared by Base UI's Select and Combobox: both keep their popup mounted
// while an `actionsRef` is set, until `actionsRef.current.unmount()`.

/** What a Root shares with its animated parts. */
type RootMotion = {
  /** Unmounts the popup: called once its exit has played. */
  unmount: () => void;
  multiple: boolean;
};

/** Animate UI's additions to `Popup`. */
type PopupAnimationProps = {
  /** Transition of the opening. Defaults to `transition.dropdown` (600ms). */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

/** Animate UI's additions to `ItemIndicator`. */
type IndicatorAnimationProps = {
  /** Transition of the check appearing. Defaults to `transition.change` (600ms). */
  transition?: Transition;
  /** Transition of the check leaving. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

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
  const tokens = useMotionTokens();
  const enter = transition ?? tokens.transition.dropdown;
  const exit = exitTransition ?? tokens.transition.exit;
  // Base UI can mount a closed popup (typeahead and autofill on the closed
  // trigger register the items): only an exit that followed an entrance
  // unmounts it.
  const shownRef = React.useRef(false);

  return (
    renderProps: PopupRenderProps,
    state: { open: boolean; side: string },
  ) => {
    const { open } = state;
    // Align-with-trigger (side "none") lays the list over the trigger like a
    // native select, lined up on the selected item: fade only.
    const aligned = state.side === 'none';
    const hidden = aligned
      ? { opacity: 0 }
      : { opacity: 0, transform: `scale(${reduce ? 1 : tokens.scale.enter})` };
    const visible = aligned
      ? { opacity: 1 }
      : { opacity: 1, transform: 'scale(1)' };

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
        }}
      />
    );
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
};

/**
 * A multiple-selection check: it stays mounted and fades and scales with the
 * selection, keeping the element the user's `render` asks for.
 */
function IndicatorMotion({
  render,
  props,
  state,
  transition,
  exitTransition,
}: IndicatorMotionProps) {
  const reduce = useShouldReduceMotion();
  const tokens = useMotionTokens();

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

  return (
    <Element
      {...(elementProps as HTMLMotionProps<'span'>)}
      // Already-selected items show their check at once when the list opens.
      initial={false}
      animate={
        state.selected
          ? {
              opacity: 1,
              transform: 'scale(1)',
              transition: transition ?? tokens.transition.change,
            }
          : {
              opacity: 0,
              transform: `scale(${reduce ? 1 : tokens.scale.enter})`,
              transition: exitTransition ?? tokens.transition.exit,
            }
      }
    />
  );
}

export {
  useRootMotion,
  usePopupRender,
  IndicatorMotion,
  type RootMotion,
  type PopupAnimationProps,
  type IndicatorAnimationProps,
  type IndicatorRender,
};
