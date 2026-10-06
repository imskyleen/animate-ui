'use client';

import * as React from 'react';
import {
  AnimatePresence,
  motion,
  usePresence as useMotionPresence,
} from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '../../../utils/motion';
import {
  OVERLAY_TRANSITION,
  getAnimateTarget,
  getContentTargets,
  getModalSide,
  motionRender,
  useBackdropFade,
  useHiddenWhenClosed,
  useContentTransitions,
  useModalTransitions,
  type ContentFlipProps,
  type ModalAnimationProps,
} from '../../../internal/modal-motion';

// Animated Root, Portal, Overlay and Content for Radix's Dialog and Alert
// Dialog, which share their structure.
//
// Radix unmounts closed content at once. The Root mirrors `open` so the
// Portal can gate itself with AnimatePresence and pass `forceMount` down:
// Radix keeps the Overlay and the Content mounted while their exit plays.
// Both render through `asChild` onto a motion.div, so every Radix attribute
// (data-state, role, ids, data-side…) stays on the element shadcn styles.

/* eslint-disable @typescript-eslint/no-explicit-any -- the factory serves two
   Radix primitives with different prop types; the public types are set by
   each primitive. */
type AnyComponent = React.ComponentType<any>;

type RadixModalParts = {
  Root: AnyComponent;
  Portal: AnyComponent;
  Overlay: AnyComponent;
  Content: AnyComponent;
};

type OpenState = { open: boolean };

type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any;
};

type PortalProps = {
  forceMount?: true;
  children?: React.ReactNode;
  [key: string]: any;
};

type PartProps = ModalAnimationProps &
  ContentFlipProps & {
    forceMount?: true;
    asChild?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  };

export function createRadixModal(parts: RadixModalParts, name: string) {
  const [OpenProvider, useOpen] = getStrictContext<OpenState>(`${name}.Root`);
  // Set inside our Portal: presence is handled there.
  const PortalContext = React.createContext<{ forceMount: boolean } | null>(
    null,
  );

  function Root(props: RootProps) {
    const controlled = props.open !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(
      props.defaultOpen ?? false,
    );
    const open = controlled ? Boolean(props.open) : uncontrolled;

    const onOpenChange = (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      props.onOpenChange?.(next);
    };

    return (
      <OpenProvider value={{ open }}>
        <parts.Root {...props} open={open} onOpenChange={onOpenChange} />
      </OpenProvider>
    );
  }

  function Portal({ forceMount, children, ...props }: PortalProps) {
    const { open } = useOpen();

    return (
      <AnimatePresence>
        {(open || forceMount) && (
          // Radix's Overlay and Content inherit `forceMount` from the Portal.
          <parts.Portal key="portal" {...props} forceMount>
            <PortalBody forceMount={Boolean(forceMount)}>{children}</PortalBody>
          </parts.Portal>
        )}
      </AnimatePresence>
    );
  }

  function PortalBody({
    forceMount,
    children,
  }: {
    forceMount: boolean;
    children?: React.ReactNode;
  }) {
    return (
      <PortalContext value={{ forceMount }}>
        <ReducedMotionConfig>{children}</ReducedMotionConfig>
      </PortalContext>
    );
  }

  /**
   * Inside our Portal, the Portal's presence drives the exit. Rendered on its
   * own (Radix allows an inline Content), the part gates itself.
   */
  function usePresence(forceMount: true | undefined) {
    const portal = React.use(PortalContext);
    const { open } = useOpen();
    const keepMounted = Boolean(forceMount ?? portal?.forceMount);
    return { open, keepMounted, inPortal: portal !== null };
  }

  function Overlay(props: PartProps) {
    const { open, keepMounted, inPortal } = usePresence(props.forceMount);
    const body = (
      <OverlayMotion {...props} open={open} keepMounted={keepMounted} />
    );
    if (inPortal) return body;
    return (
      <AnimatePresence>
        {(open || keepMounted) && (
          <ReducedMotionConfig key="overlay">{body}</ReducedMotionConfig>
        )}
      </AnimatePresence>
    );
  }

  function OverlayMotion({
    open,
    keepMounted,
    asChild,
    transition,
    exitTransition,
    children,
    style,
    ...props
  }: PartProps & { open: boolean; keepMounted: boolean }) {
    // The Portal (or the Overlay's own AnimatePresence) waits for its fade
    // out before unmounting.
    const [isPresent, safeToRemove] = useMotionPresence();
    const { hidden, onAnimationComplete } = useHiddenWhenClosed(
      open,
      keepMounted,
    );
    const ref = useBackdropFade({
      visible: open && isPresent,
      ...useModalTransitions(transition, exitTransition, OVERLAY_TRANSITION),
      onFadedOut: () => {
        onAnimationComplete();
        safeToRemove?.();
      },
    });

    return (
      <parts.Overlay {...props} forceMount asChild>
        {motionChild(asChild, children, {
          ref,
          // Once closed (exiting, or kept mounted), clicks go through to the
          // page: Radix sets `pointer-events: auto` on the overlay.
          style: closedStyle(style, open, hidden),
        })}
      </parts.Overlay>
    );
  }

  function Content(props: PartProps) {
    const { open, keepMounted, inPortal } = usePresence(props.forceMount);
    const body = (
      <ContentMotion {...props} open={open} keepMounted={keepMounted} />
    );
    if (inPortal) return body;
    return (
      <AnimatePresence>
        {(open || keepMounted) && (
          <ReducedMotionConfig key="content">{body}</ReducedMotionConfig>
        )}
      </AnimatePresence>
    );
  }

  function ContentMotion({
    open,
    keepMounted,
    asChild,
    from,
    transition,
    exitTransition,
    children,
    style,
    ...props
  }: PartProps & { open: boolean; keepMounted: boolean }) {
    const reduce = useShouldReduceMotion();
    // shadcn/ui's Sheet passes `data-side`: it slides from that edge.
    const side = getModalSide(props['data-side']);
    const { enter, exit } = useContentTransitions(
      side,
      transition,
      exitTransition,
    );
    const targets = getContentTargets({ side, from, reduce, enter, exit });
    const { hidden, onAnimationComplete } = useHiddenWhenClosed(
      open,
      keepMounted,
    );

    return (
      <parts.Content {...props} forceMount asChild>
        {motionChild(asChild, children, {
          initial: targets.initial,
          animate: getAnimateTarget(targets, open, keepMounted),
          exit: targets.exit,
          onAnimationComplete,
          // A closed Content kept mounted stays out of reach.
          inert: keepMounted && !open ? true : undefined,
          // Once closed (exiting, or kept mounted), clicks go through.
          style: closedStyle(style, open, hidden),
        })}
      </parts.Content>
    );
  }

  return { Root, Portal, Overlay, Content };
}

/**
 * The motion element Radix renders the part onto: a motion.div around the
 * children, or with `asChild`, the user's child made animatable.
 */
function motionChild(
  asChild: boolean | undefined,
  children: React.ReactNode,
  motionProps: Record<string, any>,
) {
  if (asChild && React.isValidElement(children))
    return motionRender(children, motionProps) as React.ReactElement;
  return <motion.div {...motionProps}>{children}</motion.div>;
}

function closedStyle(
  style: React.CSSProperties | undefined,
  open: boolean,
  hidden: boolean,
): React.CSSProperties | undefined {
  if (open) return style;
  return {
    ...style,
    pointerEvents: 'none',
    visibility: hidden ? 'hidden' : undefined,
  };
}
