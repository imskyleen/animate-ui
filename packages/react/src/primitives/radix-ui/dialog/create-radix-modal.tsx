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
  getAnimateTarget,
  getContentTargets,
  getModalSide,
  motionRender,
  useBackdropFade,
  useOverlayTransitions,
  useHiddenWhenClosed,
  useContentTransitions,
  type ContentFlipProps,
  type ModalAnimationProps,
} from '../../../internal/modal-motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const [isPresent, safeToRemove] = useMotionPresence();
    const { hidden, onAnimationComplete } = useHiddenWhenClosed(
      open,
      keepMounted,
    );
    const ref = useBackdropFade({
      visible: open && isPresent,
      ...useOverlayTransitions(transition, exitTransition),
      onFadedOut: () => {
        onAnimationComplete();
        safeToRemove?.();
      },
    });

    return (
      <parts.Overlay {...props} forceMount asChild>
        {motionChild(asChild, children, {
          ref,
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
    const startedClosedRef = React.useRef(new WeakSet<Event>());
    React.useEffect(() => {
      if (open) return;
      const startedClosed = startedClosedRef.current;
      const note = (event: Event) => startedClosed.add(event);
      document.addEventListener('pointerdown', note, true);
      return () => document.removeEventListener('pointerdown', note, true);
    }, [open]);

    return (
      <parts.Content
        {...props}
        onPointerDownOutside={(
          event: CustomEvent<{ originalEvent: PointerEvent }>,
        ) => {
          if (startedClosedRef.current.has(event.detail.originalEvent))
            event.preventDefault();
          props.onPointerDownOutside?.(event);
        }}
        forceMount
        asChild
      >
        {motionChild(asChild, children, {
          initial: targets.initial,
          animate: getAnimateTarget(targets, open, keepMounted),
          exit: targets.exit,
          onAnimationComplete,
          inert: keepMounted && !open ? true : undefined,
          style: closedStyle(style, open, hidden),
        })}
      </parts.Content>
    );
  }

  return { Root, Portal, Overlay, Content };
}

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
