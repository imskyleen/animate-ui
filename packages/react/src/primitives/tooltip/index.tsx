'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type Transition,
  type HTMLMotionProps,
} from 'motion/react';
import {
  useFloating,
  autoUpdate,
  offset as floatingOffset,
  flip,
  shift,
  arrow as floatingArrow,
  FloatingPortal,
  FloatingArrow,
  type UseFloatingReturn,
} from '@floating-ui/react';

import { getStrictContext } from '../../utils/strict-context';
import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Slot, type WithAsChild } from '../slot';

// Animate UI's own tooltip: every tooltip of a provider shares one popup,
// positioned with Floating UI. Moving from a trigger to the next one glides
// the popup (a shared layout animation) instead of closing and reopening it.
// It moves like the library tooltips (Radix UI, Base UI, React Aria): the
// popup grows from 0.7 and fades in from the point facing its trigger, and
// goes back the same way when it closes, on a spring as quick as theirs, a
// touch calmer (stiffness 400, damping 31: about 2% past, theirs 4%).

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

type TooltipData = {
  contentProps: HTMLMotionProps<'div'>;
  contentAsChild: boolean;
  rect: DOMRect;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
};

type GlobalTooltipContextType = {
  showTooltip: (data: TooltipData) => void;
  hideTooltip: () => void;
  hideImmediate: () => void;
  currentTooltip: TooltipData | null;
  transition: Transition;
  globalId: string;
  setReferenceEl: (el: HTMLElement | null) => void;
  referenceElRef: React.RefObject<HTMLElement | null>;
};

const [GlobalTooltipProvider, useGlobalTooltip] =
  getStrictContext<GlobalTooltipContextType>('GlobalTooltipProvider');

type TooltipContextType = {
  props: HTMLMotionProps<'div'>;
  setProps: React.Dispatch<React.SetStateAction<HTMLMotionProps<'div'>>>;
  asChild: boolean;
  setAsChild: React.Dispatch<React.SetStateAction<boolean>>;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
};

const [LocalTooltipProvider, useTooltip] = getStrictContext<TooltipContextType>(
  'LocalTooltipProvider',
);

type TooltipPosition = { x: number; y: number };

/** The popup's id, referenced by its trigger's `aria-describedby`. */
const contentIdOf = (id: string) => `${id}-tooltip`;

function getResolvedSide(placement: Side | `${Side}-${Align}`) {
  if (placement.includes('-')) {
    return placement.split('-')[0] as Side;
  }
  return placement as Side;
}

/**
 * The entrance, the exit and the glide between triggers: as quick as the
 * library tooltips' spring, a touch calmer.
 */
const TOOLTIP_TRANSITION = motionTokens.spring.tooltip;

/**
 * The point of the popup facing its trigger (Motion's `originX`/`originY`,
 * which its layout projection takes into account): it grows out of the
 * trigger, like the library tooltips from their origin variables.
 */
function originFor(side: Side, align: Align) {
  const along = align === 'start' ? 0 : align === 'end' ? 1 : 0.5;
  if (side === 'top') return { originX: along, originY: 1 };
  if (side === 'bottom') return { originX: along, originY: 0 };
  if (side === 'left') return { originX: 1, originY: along };
  return { originX: 0, originY: along };
}

type TooltipProviderProps = {
  children: React.ReactNode;
  id?: string;
  openDelay?: number;
  closeDelay?: number;
  transition?: Transition;
};

function TooltipProvider({
  children,
  id,
  openDelay = 0,
  closeDelay = 300,
  transition: transitionProp = TOOLTIP_TRANSITION,
}: TooltipProviderProps) {
  const transition = useTempoTransition(transitionProp);
  const globalId = React.useId();
  const [currentTooltip, setCurrentTooltip] =
    React.useState<TooltipData | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const lastCloseTimeRef = React.useRef<number>(0);
  const referenceElRef = React.useRef<HTMLElement | null>(null);

  const showTooltip = React.useCallback(
    (data: TooltipData) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (currentTooltip !== null) {
        setCurrentTooltip(data);
        return;
      }
      const now = Date.now();
      const delay = now - lastCloseTimeRef.current < closeDelay ? 0 : openDelay;
      timeoutRef.current = window.setTimeout(
        () => setCurrentTooltip(data),
        delay,
      );
    },
    [openDelay, closeDelay, currentTooltip],
  );

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrentTooltip(null);
      lastCloseTimeRef.current = Date.now();
    }, closeDelay);
  }, [closeDelay]);

  const hideImmediate = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentTooltip(null);
    lastCloseTimeRef.current = Date.now();
  }, []);

  const setReferenceEl = React.useCallback((el: HTMLElement | null) => {
    referenceElRef.current = el;
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideImmediate();
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', hideImmediate, true);
    window.addEventListener('resize', hideImmediate, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', hideImmediate, true);
      window.removeEventListener('resize', hideImmediate, true);
    };
  }, [hideImmediate]);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <GlobalTooltipProvider
      value={{
        showTooltip,
        hideTooltip,
        hideImmediate,
        currentTooltip,
        transition,
        globalId: id ?? globalId,
        setReferenceEl,
        referenceElRef,
      }}
    >
      <ReducedMotionConfig>
        <LayoutGroup>{children}</LayoutGroup>
        <TooltipOverlay />
      </ReducedMotionConfig>
    </GlobalTooltipProvider>
  );
}

type RenderedTooltipContextType = {
  side: Side;
  align: Align;
  open: boolean;
  /** Floating UI has placed the popup (it's measured unseen until then). */
  positioned: boolean;
};

const [RenderedTooltipProvider, useRenderedTooltip] =
  getStrictContext<RenderedTooltipContextType>('RenderedTooltipContext');

type FloatingContextType = {
  context: UseFloatingReturn['context'];
  arrowRef: React.RefObject<SVGSVGElement | null>;
};

const [FloatingProvider, useFloatingContext] =
  getStrictContext<FloatingContextType>('FloatingContext');

const MotionTooltipArrow = motion.create(FloatingArrow);

type TooltipArrowProps = Omit<
  React.ComponentProps<typeof MotionTooltipArrow>,
  'context'
> & {
  withTransition?: boolean;
};

function TooltipArrow({
  ref,
  withTransition = true,
  ...props
}: TooltipArrowProps) {
  const { side, align, open, positioned } = useRenderedTooltip();
  const { context, arrowRef } = useFloatingContext();
  const { transition, globalId } = useGlobalTooltip();
  React.useImperativeHandle(ref, () => arrowRef.current as SVGSVGElement);

  const deg = { top: 0, right: 90, bottom: 180, left: -90 }[side];

  return (
    <MotionTooltipArrow
      ref={arrowRef}
      context={context}
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      data-align={align}
      data-slot="tooltip-arrow"
      style={{ rotate: deg }}
      // Like the popup's: no layoutId while it's measured at 0, 0, or the
      // arrow would fly in from there.
      layoutId={
        withTransition && positioned ? `tooltip-arrow-${globalId}` : undefined
      }
      transition={withTransition ? transition : undefined}
      {...props}
    />
  );
}

type TooltipPortalProps = React.ComponentProps<typeof FloatingPortal>;

function TooltipPortal(props: TooltipPortalProps) {
  return <FloatingPortal {...props} />;
}

function TooltipOverlay() {
  const { currentTooltip, transition, globalId, referenceElRef } =
    useGlobalTooltip();
  const reduce = useShouldReduceMotion();

  const [rendered, setRendered] = React.useState<{
    data: TooltipData | null;
    open: boolean;
  }>({ data: null, open: false });

  const arrowRef = React.useRef<SVGSVGElement | null>(null);

  const side = rendered.data?.side ?? 'top';
  const align = rendered.data?.align ?? 'center';

  const { refs, x, y, strategy, context, update, isPositioned } = useFloating({
    // Tracked so `isPositioned` tells when the first position is known.
    open: rendered.data !== null,
    placement: align === 'center' ? side : `${side}-${align}`,
    whileElementsMounted: autoUpdate,
    middleware: [
      floatingOffset({
        mainAxis: rendered.data?.sideOffset ?? 0,
        crossAxis: rendered.data?.alignOffset ?? 0,
      }),
      flip(),
      shift({ padding: 8 }),
      floatingArrow({ element: arrowRef }),
    ],
  });

  React.useEffect(() => {
    if (currentTooltip) {
      setRendered({ data: currentTooltip, open: true });
    } else {
      setRendered((p) => (p.data ? { ...p, open: false } : p));
    }
  }, [currentTooltip]);

  React.useLayoutEffect(() => {
    if (referenceElRef.current) {
      refs.setReference(referenceElRef.current);
      update();
    }
  }, [referenceElRef, refs, update, rendered.data]);

  const Component = rendered.data?.contentAsChild ? Slot : motion.div;
  const resolvedSide = getResolvedSide(context.placement);
  const resolvedAlign =
    (context.placement.split('-')[1] as Align | undefined) ?? 'center';

  // Grows from 0.7 out of the trigger. Under reduced motion it only fades,
  // and moving between triggers jumps.
  const hidden = rendered.data
    ? { opacity: 0, scale: reduce ? 1 : motionTokens.scale.tooltip }
    : { opacity: 0 };

  return (
    <AnimatePresence mode="wait">
      {rendered.data && (
        <TooltipPortal>
          <div
            ref={refs.setFloating}
            data-slot="tooltip-overlay"
            data-side={resolvedSide}
            data-align={rendered.data.align}
            data-state={rendered.open ? 'open' : 'closed'}
            style={{
              position: strategy,
              top: 0,
              left: 0,
              zIndex: 50,
              transform: `translate3d(${x}px, ${y}px, 0)`,
              // Measured unseen until Floating UI has placed it.
              visibility: isPositioned ? undefined : 'hidden',
            }}
          >
            <FloatingProvider value={{ context, arrowRef }}>
              <RenderedTooltipProvider
                value={{
                  side: resolvedSide,
                  align: rendered.data.align,
                  open: rendered.open,
                  positioned: isPositioned,
                }}
              >
                <Component
                  // Floating UI renders the popup at 0, 0 before it has
                  // measured it. Until it's placed, the popup is measured
                  // without its layoutId (the shared layout animation would
                  // fly it in from the corner), then mounts afresh where it
                  // belongs and plays its entrance there. Moving between
                  // triggers keeps the same element: it glides.
                  key={isPositioned ? 'positioned' : 'measuring'}
                  id={contentIdOf(rendered.data.id)}
                  role="tooltip"
                  data-slot="tooltip-content"
                  data-side={resolvedSide}
                  data-align={rendered.data.align}
                  data-state={rendered.open ? 'open' : 'closed'}
                  layoutId={
                    isPositioned ? `tooltip-content-${globalId}` : undefined
                  }
                  initial={hidden}
                  // One spring for everything: the entrance, the exit and
                  // the shared layout move between triggers.
                  animate={
                    rendered.open
                      ? { opacity: 1, scale: 1, transition }
                      : { ...hidden, transition }
                  }
                  exit={{ ...hidden, transition }}
                  onAnimationComplete={() => {
                    if (!rendered.open)
                      setRendered({ data: null, open: false });
                  }}
                  transition={transition}
                  {...rendered.data.contentProps}
                  style={{
                    position: 'relative',
                    ...originFor(resolvedSide, resolvedAlign),
                    ...(rendered.data.contentProps?.style || {}),
                  }}
                />
              </RenderedTooltipProvider>
            </FloatingProvider>
          </div>
        </TooltipPortal>
      )}
    </AnimatePresence>
  );
}

type TooltipProps = {
  children: React.ReactNode;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
};

function Tooltip({
  children,
  side = 'top',
  sideOffset = 10,
  align = 'center',
  alignOffset = 0,
}: TooltipProps) {
  const id = React.useId();
  const [props, setProps] = React.useState<HTMLMotionProps<'div'>>({});
  const [asChild, setAsChild] = React.useState(false);

  return (
    <LocalTooltipProvider
      value={{
        props,
        setProps,
        asChild,
        setAsChild,
        side,
        sideOffset,
        align,
        alignOffset,
        id,
      }}
    >
      {children}
    </LocalTooltipProvider>
  );
}

type TooltipContentProps = WithAsChild<HTMLMotionProps<'div'>>;

function shallowEqualWithoutChildren(
  a?: HTMLMotionProps<'div'>,
  b?: HTMLMotionProps<'div'>,
) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a).filter((k) => k !== 'children');
  const keysB = Object.keys(b).filter((k) => k !== 'children');
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    // @ts-expect-error index
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/**
 * Declares what the tooltip shows. It renders nothing in place: the
 * provider's shared popup renders its props.
 */
function TooltipContent({ asChild = false, ...props }: TooltipContentProps) {
  const { setProps, setAsChild } = useTooltip();
  const lastPropsRef = React.useRef<HTMLMotionProps<'div'> | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (!shallowEqualWithoutChildren(lastPropsRef.current, props)) {
      lastPropsRef.current = props;
      setProps(props);
    }
  }, [props, setProps]);

  React.useEffect(() => {
    setAsChild(asChild);
  }, [asChild, setAsChild]);

  return null;
}

type TooltipTriggerProps = WithAsChild<HTMLMotionProps<'div'>>;

function TooltipTrigger({
  ref,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerDown,
  asChild = false,
  ...props
}: TooltipTriggerProps) {
  const {
    props: contentProps,
    asChild: contentAsChild,
    side,
    sideOffset,
    align,
    alignOffset,
    id,
  } = useTooltip();
  const {
    showTooltip,
    hideTooltip,
    hideImmediate,
    currentTooltip,
    setReferenceEl,
  } = useGlobalTooltip();

  const triggerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const suppressNextFocusRef = React.useRef(false);

  const handleOpen = React.useCallback(() => {
    if (!triggerRef.current) return;
    setReferenceEl(triggerRef.current);
    const rect = triggerRef.current.getBoundingClientRect();
    showTooltip({
      contentProps,
      contentAsChild,
      rect,
      side,
      sideOffset,
      align,
      alignOffset,
      id,
    });
  }, [
    showTooltip,
    setReferenceEl,
    contentProps,
    contentAsChild,
    side,
    sideOffset,
    align,
    alignOffset,
    id,
  ]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(e);
      if (currentTooltip?.id === id) {
        suppressNextFocusRef.current = true;
        hideImmediate();
        Promise.resolve().then(() => {
          suppressNextFocusRef.current = false;
        });
      }
    },
    [onPointerDown, currentTooltip?.id, id, hideImmediate],
  );

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
      handleOpen();
    },
    [handleOpen, onMouseEnter],
  );

  const handleMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      hideTooltip();
    },
    [hideTooltip, onMouseLeave],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      if (suppressNextFocusRef.current) return;
      handleOpen();
    },
    [handleOpen, onFocus],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);
      hideTooltip();
    },
    [hideTooltip, onBlur],
  );

  const Component = asChild ? Slot : motion.div;
  const open = currentTooltip?.id === id;

  return (
    <Component
      ref={triggerRef}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-describedby={open ? contentIdOf(id) : undefined}
      data-slot="tooltip-trigger"
      data-side={side}
      data-align={align}
      data-state={open ? 'open' : 'closed'}
      {...props}
    />
  );
}

export {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
  useGlobalTooltip,
  useTooltip,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipContentProps,
  type TooltipTriggerProps,
  type TooltipArrowProps,
  type TooltipPosition,
  type GlobalTooltipContextType,
  type TooltipContextType,
};
