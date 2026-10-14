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
  const PortalContext = React.createContext(false);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function Portal({ forceMount, children, ...props }: PortalProps) {
    const { open } = useOpen();

    return (
      <AnimatePresence>
        {open && (
          <parts.Portal key="portal" {...props} forceMount>
            <PortalContext value>
              <ReducedMotionConfig>{children}</ReducedMotionConfig>
            </PortalContext>
          </parts.Portal>
        )}
      </AnimatePresence>
    );
  }

  function usePresence() {
    const inPortal = React.use(PortalContext);
    const { open } = useOpen();
    return { open, inPortal };
  }

  function Overlay(props: PartProps) {
    const { open, inPortal } = usePresence();
    const body = <OverlayMotion {...props} open={open} />;
    if (inPortal) return body;
    return (
      <AnimatePresence>
        {open && (
          <ReducedMotionConfig key="overlay">{body}</ReducedMotionConfig>
        )}
      </AnimatePresence>
    );
  }

  function OverlayMotion({
    open,
    asChild,
    transition,
    exitTransition,
    children,
    style,
    ...props
  }: PartProps & { open: boolean }) {
    const [isPresent, safeToRemove] = useMotionPresence();
    const { hidden, onAnimationComplete } = useHiddenWhenClosed(open, false);
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
    const { open, inPortal } = usePresence();
    const body = <ContentMotion {...props} open={open} />;
    if (inPortal) return body;
    return (
      <AnimatePresence>
        {open && (
          <ReducedMotionConfig key="content">{body}</ReducedMotionConfig>
        )}
      </AnimatePresence>
    );
  }

  function ContentMotion({
    open,
    asChild,
    from,
    transition,
    exitTransition,
    children,
    style,
    ...props
  }: PartProps & { open: boolean }) {
    const reduce = useShouldReduceMotion();
    const side = getModalSide(props['data-side']);
    const { enter, exit } = useContentTransitions(
      side,
      transition,
      exitTransition,
    );
    const targets = getContentTargets({ side, from, reduce, enter, exit });
    const { hidden, onAnimationComplete } = useHiddenWhenClosed(open, false);
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
          animate: getAnimateTarget(targets, open, false),
          exit: targets.exit,
          onAnimationComplete,
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
