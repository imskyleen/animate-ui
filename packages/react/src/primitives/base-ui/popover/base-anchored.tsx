'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';

import {
  asMotion,
  useAnchoredMotion,
  type AnchoredAnimationProps,
  type AnchoredKind,
} from '../../../internal/anchored';
import { useFollowCursorStyle } from '../../../internal/follow-cursor';

type ChangeDetails = { isCanceled: boolean };

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
    if (details.isCanceled) return;
    if (!controlled) setUncontrolled(next);
  };

  return [open, setOpen] as const;
}

type BaseAnchoredPortalProps = {
  component: React.ElementType;
  portalProps: Record<string, unknown>;
  open: boolean;
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
  component: React.ElementType;
  popupProps: { render?: RenderProp; style?: StyleProp } & Record<
    string,
    unknown
  >;
  open: boolean;
  keepMounted: boolean;
  kind?: AnchoredKind;
};

const ORIGIN = 'var(--transform-origin)';

function BaseAnchoredPopup({
  component: Popup,
  popupProps: { render, style, ...popupProps },
  open,
  keepMounted,
  kind,
  transition,
  exitTransition,
}: BaseAnchoredPopupProps) {
  const follow = useFollowCursorStyle();
  const motionProps = useAnchoredMotion({
    kind,
    open,
    keepMounted,
    transition,
    exitTransition,
  });

  return (
    <Popup
      {...popupProps}
      style={
        typeof style === 'function'
          ? (state: unknown) => ({ transformOrigin: ORIGIN, ...style(state) })
          : { transformOrigin: ORIGIN, ...style }
      }
      render={motionRender(render, {
        ...motionProps,
        style: { ...motionProps.style, ...follow },
      })}
    />
  );
}

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
