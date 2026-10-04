'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

import {
  asMotion,
  useAnchoredMotion,
  type AnchoredAnimationProps,
} from '../../../internal/anchored';

// The Base UI side of Popover, PreviewCard and Tooltip. The Root mirrors the
// open state and hands it back to Base UI (one source of truth). The Portal
// gates its subtree with AnimatePresence and keeps Base UI's portal mounted
// meanwhile, so the Popup's exit can play before anything unmounts. Base UI
// waits for the popup's running animations (Motion's are WAAPI) before it
// hides the positioner.

type ChangeDetails = { isCanceled: boolean };

/** Open state of a Base UI Root, controlled or not. Honours `cancel()`. */
function useBaseOpenState<Details extends ChangeDetails>(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean, details: Details) => void) | undefined,
) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;

  const setOpen = (next: boolean, details: Details) => {
    onOpenChange?.(next, details);
    // Base UI lets the handler cancel the change.
    if (details.isCanceled) return;
    if (!controlled) setUncontrolled(next);
  };

  return [open, setOpen] as const;
}

type BaseAnchoredPortalProps = {
  /** Base UI's Portal part. */
  component: React.ElementType;
  portalProps: Record<string, unknown>;
  open: boolean;
  /** The user's `keepMounted`: the subtree stays, the Popup hides in place. */
  keepMounted: boolean;
};

function BaseAnchoredPortal({
  component: Portal,
  portalProps,
  open,
  keepMounted,
}: BaseAnchoredPortalProps) {
  if (keepMounted) return <Portal {...portalProps} keepMounted />;

  return (
    <AnimatePresence>
      {open && <Portal key="portal" {...portalProps} keepMounted />}
    </AnimatePresence>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderFunction = (props: any, state: any) => React.ReactElement;
type RenderProp = React.ReactElement | RenderFunction | undefined;
type StyleProp =
  | React.CSSProperties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((state: any) => React.CSSProperties | undefined)
  | undefined;

type BaseAnchoredPopupProps = AnchoredAnimationProps & {
  /** Base UI's Popup part. */
  component: React.ElementType;
  popupProps: { render?: RenderProp; style?: StyleProp } & Record<
    string,
    unknown
  >;
  open: boolean;
  keepMounted: boolean;
};

const ORIGIN = 'var(--transform-origin)';

/**
 * The animated Popup. Base UI renders it as the motion element (`render`),
 * so its props, state attributes and resolved className land on it.
 */
function BaseAnchoredPopup({
  component: Popup,
  popupProps: { render, style, ...popupProps },
  open,
  keepMounted,
  transition,
  exitTransition,
}: BaseAnchoredPopupProps) {
  const motionProps = useAnchoredMotion({
    open,
    keepMounted,
    transition,
    exitTransition,
  });

  return (
    <Popup
      {...popupProps}
      // Grows from the trigger (Base UI's Positioner sets the variable).
      // Before the user's style, so it can be changed.
      style={
        typeof style === 'function'
          ? (state: unknown) => ({ transformOrigin: ORIGIN, ...style(state) })
          : { transformOrigin: ORIGIN, ...style }
      }
      render={motionRender(render, motionProps)}
    />
  );
}

/** A `motion.div`, or the element the user renders made animatable. */
function motionRender(render: RenderProp, props: Record<string, unknown>) {
  if (typeof render === 'function') {
    const fn: RenderFunction = (renderProps, state) =>
      asMotion(render(renderProps, state), props);
    return fn;
  }
  if (render) return asMotion(render, props);
  return <motion.div {...props} />;
}

export {
  useBaseOpenState,
  BaseAnchoredPortal,
  BaseAnchoredPopup,
  type AnchoredAnimationProps,
};
