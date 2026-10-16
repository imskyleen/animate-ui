'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.highlight;

const INSTANT: Transition = { duration: 0 };

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ') || undefined;
}

type HighlightMode = 'children' | 'parent';

type Bounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const DEFAULT_BOUNDS_OFFSET: Bounds = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

type HighlightContextType<T extends string> = {
  as?: keyof HTMLElementTagNameMap;
  mode: HighlightMode;
  activeValue: T | null;
  previousValue: T | null;
  setActiveValue: (value: T | null) => void;
  setBounds: (bounds: DOMRect) => void;
  clearBounds: () => void;
  id: string;
  hover: boolean;
  click: boolean;
  className?: string;
  style?: React.CSSProperties;
  activeClassName?: string;
  setActiveClassName: (className: string) => void;
  transition?: Transition;
  disabled?: boolean;
  enabled?: boolean;
  exitDelay?: number;
  forceUpdateBounds?: boolean;
};

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function subscribeToHoverCapability(onChange: () => void) {
  const mql = window.matchMedia(HOVER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function useCanHover() {
  return React.useSyncExternalStore(
    subscribeToHoverCapability,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

type ParentHighlightProps = {
  bounds: Bounds | null;
  transition: Transition;
  exitDelay: number;
  className?: string;
  style?: React.CSSProperties;
};

function ParentHighlight({
  bounds,
  transition,
  exitDelay,
  className,
  style,
}: ParentHighlightProps) {
  const reduceMotion = useShouldReduceMotion();
  const moveTransition: Transition = reduceMotion
    ? {
        ...transition,
        top: INSTANT,
        left: INSTANT,
        width: INSTANT,
        height: INSTANT,
      }
    : transition;

  return (
    <AnimatePresence initial={false} mode="wait">
      {bounds && (
        <motion.div
          data-slot="motion-highlight"
          animate={{
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
            opacity: 1,
          }}
          initial={{
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
            opacity: 0,
          }}
          exit={{
            opacity: 0,
            transition: {
              ...transition,
              delay: (transition?.delay ?? 0) + (exitDelay ?? 0) / 1000,
            },
          }}
          transition={moveTransition}
          style={{ position: 'absolute', zIndex: 0, ...style }}
          className={className}
        />
      )}
    </AnimatePresence>
  );
}

const HighlightContext = React.createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HighlightContextType<any> | undefined
>(undefined);

function useHighlight<T extends string>(): HighlightContextType<T> {
  const context = React.useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context as unknown as HighlightContextType<T>;
}

type BaseHighlightProps<T extends React.ElementType = 'div'> = {
  as?: T;
  ref?: React.Ref<HTMLDivElement>;
  mode?: HighlightMode;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
  style?: React.CSSProperties;
  transition?: Transition;
  hover?: boolean;
  click?: boolean;
  disabled?: boolean;
  enabled?: boolean;
  exitDelay?: number;
};

type ParentModeHighlightProps = {
  boundsOffset?: Partial<Bounds>;
  containerClassName?: string;
  forceUpdateBounds?: boolean;
};

type ControlledParentModeHighlightProps<T extends React.ElementType = 'div'> =
  BaseHighlightProps<T> &
    ParentModeHighlightProps & {
      mode: 'parent';
      controlledItems: true;
      children: React.ReactNode;
    };

type ControlledChildrenModeHighlightProps<T extends React.ElementType = 'div'> =
  BaseHighlightProps<T> & {
    mode?: 'children' | undefined;
    controlledItems: true;
    children: React.ReactNode;
  };

type UncontrolledParentModeHighlightProps<T extends React.ElementType = 'div'> =
  BaseHighlightProps<T> &
    ParentModeHighlightProps & {
      mode: 'parent';
      controlledItems?: false;
      itemsClassName?: string;
      children: React.ReactElement | React.ReactElement[];
    };

type UncontrolledChildrenModeHighlightProps<
  T extends React.ElementType = 'div',
> = BaseHighlightProps<T> & {
  mode?: 'children';
  controlledItems?: false;
  itemsClassName?: string;
  children: React.ReactElement | React.ReactElement[];
};

type HighlightProps<T extends React.ElementType = 'div'> =
  | ControlledParentModeHighlightProps<T>
  | ControlledChildrenModeHighlightProps<T>
  | UncontrolledParentModeHighlightProps<T>
  | UncontrolledChildrenModeHighlightProps<T>;

function Highlight<T extends React.ElementType = 'div'>({
  ref,
  ...props
}: HighlightProps<T>) {
  const {
    as: Component = 'div',
    children,
    value,
    defaultValue,
    onValueChange,
    className,
    style,
    transition: transitionProp,
    hover = false,
    click = true,
    enabled = true,
    controlledItems,
    disabled = false,
    exitDelay: exitDelayProp = 200,
    mode = 'children',
  } = props;

  const { tempo } = useMotionTokens();
  const transition = useTempoTransition(transitionProp ?? HIGHLIGHT_TRANSITION);
  const exitDelay = exitDelayProp * tempo;

  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const propsBoundsOffset = (props as ParentModeHighlightProps)?.boundsOffset;
  const boundsOffset = propsBoundsOffset ?? DEFAULT_BOUNDS_OFFSET;
  const boundsOffsetTop = boundsOffset.top ?? 0;
  const boundsOffsetLeft = boundsOffset.left ?? 0;
  const boundsOffsetWidth = boundsOffset.width ?? 0;
  const boundsOffsetHeight = boundsOffset.height ?? 0;

  const boundsOffsetRef = React.useRef({
    top: boundsOffsetTop,
    left: boundsOffsetLeft,
    width: boundsOffsetWidth,
    height: boundsOffsetHeight,
  });

  React.useEffect(() => {
    boundsOffsetRef.current = {
      top: boundsOffsetTop,
      left: boundsOffsetLeft,
      width: boundsOffsetWidth,
      height: boundsOffsetHeight,
    };
  }, [
    boundsOffsetTop,
    boundsOffsetLeft,
    boundsOffsetWidth,
    boundsOffsetHeight,
  ]);

  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | null>(
    defaultValue ?? null,
  );
  const activeValue = controlled ? value : internalValue;
  const [values, setValues] = React.useState<{
    current: string | null;
    previous: string | null;
  }>({ current: activeValue ?? null, previous: null });
  if (values.current !== (activeValue ?? null))
    setValues({ current: activeValue ?? null, previous: values.current });
  const [boundsState, setBoundsState] = React.useState<Bounds | null>(null);
  const [activeClassNameState, setActiveClassNameState] =
    React.useState<string>('');

  const safeSetActiveValue = (id: string | null) => {
    if (id === activeValue) return;
    if (!controlled) setInternalValue(id);
    onValueChange?.(id);
  };

  const safeSetBoundsRef = React.useRef<
    ((bounds: DOMRect) => void) | undefined
  >(undefined);

  React.useEffect(() => {
    safeSetBoundsRef.current = (bounds: DOMRect) => {
      if (!localRef.current) return;

      const containerRect = localRef.current.getBoundingClientRect();
      const offset = boundsOffsetRef.current;
      const newBounds: Bounds = {
        top: bounds.top - containerRect.top + offset.top,
        left: bounds.left - containerRect.left + offset.left,
        width: bounds.width + offset.width,
        height: bounds.height + offset.height,
      };

      setBoundsState((prev) => {
        if (
          prev &&
          prev.top === newBounds.top &&
          prev.left === newBounds.left &&
          prev.width === newBounds.width &&
          prev.height === newBounds.height
        ) {
          return prev;
        }
        return newBounds;
      });
    };
  });

  const safeSetBounds = (bounds: DOMRect) => {
    safeSetBoundsRef.current?.(bounds);
  };

  const clearBounds = React.useCallback(() => {
    setBoundsState((prev) => (prev === null ? prev : null));
  }, []);

  React.useEffect(() => {
    if (defaultValue !== undefined) setInternalValue(defaultValue);
  }, [defaultValue]);

  const id = React.useId();

  React.useEffect(() => {
    if (mode !== 'parent') return;
    const container = localRef.current;
    if (!container) return;

    const onScroll = () => {
      if (!activeValue) return;
      const activeEl = container.querySelector<HTMLElement>(
        `[data-value="${activeValue}"][data-highlight="true"]`,
      );
      if (activeEl)
        safeSetBoundsRef.current?.(activeEl.getBoundingClientRect());
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [mode, activeValue]);

  const render = (children: React.ReactNode) => {
    if (mode === 'parent') {
      return (
        <Component
          ref={localRef}
          data-slot="motion-highlight-container"
          style={{ position: 'relative', zIndex: 1 }}
          className={(props as ParentModeHighlightProps)?.containerClassName}
        >
          <ParentHighlight
            bounds={boundsState}
            transition={transition}
            exitDelay={exitDelay}
            style={style}
            className={cn(className, activeClassNameState)}
          />
          {children}
        </Component>
      );
    }

    return children;
  };

  return (
    <HighlightContext.Provider
      value={{
        mode,
        activeValue,
        previousValue: values.previous,
        setActiveValue: safeSetActiveValue,
        id,
        hover,
        click,
        className,
        style,
        transition,
        disabled,
        enabled,
        exitDelay,
        setBounds: safeSetBounds,
        clearBounds,
        activeClassName: activeClassNameState,
        setActiveClassName: setActiveClassNameState,
        forceUpdateBounds: (props as ParentModeHighlightProps)
          ?.forceUpdateBounds,
      }}
    >
      <ReducedMotionConfig>
        {enabled
          ? controlledItems
            ? render(children)
            : render(
                React.Children.map(children, (child, index) => (
                  <HighlightItem key={index} className={props?.itemsClassName}>
                    {child}
                  </HighlightItem>
                )),
              )
          : children}
      </ReducedMotionConfig>
    </HighlightContext.Provider>
  );
}

function getNonOverridingDataAttributes(
  element: React.ReactElement,
  dataAttributes: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(dataAttributes).reduce<Record<string, unknown>>(
    (acc, key) => {
      if ((element.props as Record<string, unknown>)[key] === undefined) {
        acc[key] = dataAttributes[key];
      }
      return acc;
    },
    {},
  );
}

type ExtendedChildProps = React.ComponentProps<'div'> & {
  id?: string;
  ref?: React.Ref<HTMLElement>;
  'data-active'?: string;
  'data-value'?: string;
  'data-disabled'?: boolean;
  'data-highlight'?: boolean;
  'data-slot'?: string;
};

type HighlightItemProps<T extends React.ElementType = 'div'> =
  React.ComponentProps<T> & {
    as?: T;
    children: React.ReactElement;
    id?: string;
    value?: string;
    className?: string;
    style?: React.CSSProperties;
    transition?: Transition;
    activeClassName?: string;
    disabled?: boolean;
    exitDelay?: number;
    asChild?: boolean;
    forceUpdateBounds?: boolean;
  };

function HighlightItem<T extends React.ElementType>({
  ref,
  as,
  children,
  id,
  value,
  className,
  style,
  transition,
  disabled,
  activeClassName,
  exitDelay,
  asChild = false,
  forceUpdateBounds,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: HighlightItemProps<T>) {
  const itemId = React.useId();
  const {
    activeValue,
    previousValue,
    setActiveValue,
    mode,
    setBounds,
    clearBounds,
    hover,
    click,
    enabled,
    className: contextClassName,
    style: contextStyle,
    transition: contextTransition,
    id: contextId,
    disabled: contextDisabled,
    exitDelay: contextExitDelay,
    forceUpdateBounds: contextForceUpdateBounds,
    setActiveClassName,
  } = useHighlight();

  const Component = as ?? 'div';
  const element = children as React.ReactElement<ExtendedChildProps>;
  const childValue =
    id ?? value ?? element.props?.['data-value'] ?? element.props?.id ?? itemId;
  const isActive = activeValue === childValue;
  const handOff = activeValue !== null;
  const handedTo =
    isActive && previousValue !== null && previousValue !== childValue;
  const isDisabled = disabled === undefined ? contextDisabled : disabled;
  const { tempo } = useMotionTokens();
  const ownTransition = useTempoTransition(transition);
  const itemTransition = ownTransition ?? contextTransition;
  const itemExitDelay =
    exitDelay === undefined ? contextExitDelay : exitDelay * tempo;
  const fade = {
    hidden: (handingOff: boolean) => ({
      opacity: 0,
      transition: handingOff
        ? { duration: 0 }
        : {
            ...itemTransition,
            delay: (itemTransition?.delay ?? 0) + (itemExitDelay ?? 0) / 1000,
          },
    }),
    shown: { opacity: 1 },
  };

  const canHover = useCanHover();

  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const childRef = React.isValidElement(children)
    ? (children as React.ReactElement<ExtendedChildProps>).props.ref
    : undefined;
  const refCallback = React.useMemo(
    () => mergeRefs<HTMLElement>(localRef as React.Ref<HTMLElement>, childRef),
    [childRef],
  );

  React.useEffect(() => {
    if (mode !== 'parent') return;
    let rafId: number;
    let previousBounds: Bounds | null = null;
    const shouldUpdateBounds =
      forceUpdateBounds === true ||
      (contextForceUpdateBounds && forceUpdateBounds !== false);

    const updateBounds = () => {
      if (!localRef.current) return;

      const bounds = localRef.current.getBoundingClientRect();

      if (shouldUpdateBounds) {
        if (
          previousBounds &&
          previousBounds.top === bounds.top &&
          previousBounds.left === bounds.left &&
          previousBounds.width === bounds.width &&
          previousBounds.height === bounds.height
        ) {
          rafId = requestAnimationFrame(updateBounds);
          return;
        }
        previousBounds = bounds;
        rafId = requestAnimationFrame(updateBounds);
      }

      setBounds(bounds);
    };

    let observer: ResizeObserver | undefined;
    if (isActive && isDisabled) clearBounds();
    else if (isActive) {
      updateBounds();
      setActiveClassName(activeClassName ?? '');
      const node = localRef.current;
      if (node && !shouldUpdateBounds) {
        observer = new ResizeObserver(() => updateBounds());
        observer.observe(node);
        const container = node.closest(
          '[data-slot="motion-highlight-container"]',
        );
        if (container) observer.observe(container);
      }
    } else if (!activeValue) clearBounds();

    return () => {
      observer?.disconnect();
      if (shouldUpdateBounds) cancelAnimationFrame(rafId);
    };
  }, [
    mode,
    isActive,
    isDisabled,
    activeValue,
    setBounds,
    clearBounds,
    activeClassName,
    setActiveClassName,
    forceUpdateBounds,
    contextForceUpdateBounds,
  ]);

  if (!React.isValidElement(children)) return children;

  const dataAttributes = {
    'data-active': isActive ? 'true' : 'false',
    'data-disabled': isDisabled,
    'data-value': childValue,
    'data-highlight': true,
  };

  const own = { onClick, onMouseEnter, onMouseLeave } as Pick<
    ExtendedChildProps,
    'onClick' | 'onMouseEnter' | 'onMouseLeave'
  >;
  const handler =
    (
      name: 'onClick' | 'onMouseEnter' | 'onMouseLeave',
      next: string | null,
      active: boolean,
    ) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (active) setActiveValue(next);
      if (asChild) element.props[name]?.(e);
      own[name]?.(e);
    };

  const handlers = {
    onMouseEnter: handler('onMouseEnter', childValue, hover && canHover),
    onMouseLeave: handler('onMouseLeave', null, hover && canHover),
    onClick: handler('onClick', childValue, !hover && click),
  };

  if (asChild) {
    if (mode === 'children') {
      return React.cloneElement(
        element,
        {
          key: childValue,
          ref: refCallback,
          className: cn('relative', element.props.className),
          ...getNonOverridingDataAttributes(element, {
            ...dataAttributes,
            'data-slot': 'motion-highlight-item-container',
          }),
          ...props,
          ...handlers,
        },
        <>
          <AnimatePresence initial={false} mode="wait" custom={handOff}>
            {isActive && !isDisabled && (
              <motion.div
                layoutId={`transition-background-${contextId}`}
                data-slot="motion-highlight"
                style={{
                  position: 'absolute',
                  zIndex: 0,
                  ...contextStyle,
                  ...style,
                }}
                className={cn(contextClassName, activeClassName)}
                transition={itemTransition}
                layoutCrossfade={false}
                custom={handOff}
                variants={fade}
                initial={handedTo ? false : 'hidden'}
                animate="shown"
                exit="hidden"
                {...dataAttributes}
              />
            )}
          </AnimatePresence>

          <Component
            data-slot="motion-highlight-item"
            style={{ position: 'relative', zIndex: 1 }}
            className={className}
            {...dataAttributes}
          >
            {children}
          </Component>
        </>,
      );
    }

    return React.cloneElement(element, {
      ref: refCallback,
      ...getNonOverridingDataAttributes(element, {
        ...dataAttributes,
        'data-slot': 'motion-highlight-item',
      }),
      ...handlers,
    });
  }

  return enabled ? (
    <Component
      key={childValue}
      ref={localRef}
      data-slot="motion-highlight-item-container"
      className={cn(mode === 'children' && 'relative', className)}
      {...dataAttributes}
      {...props}
      {...handlers}
    >
      {mode === 'children' && (
        <AnimatePresence initial={false} mode="wait" custom={handOff}>
          {isActive && !isDisabled && (
            <motion.div
              layoutId={`transition-background-${contextId}`}
              data-slot="motion-highlight"
              style={{
                position: 'absolute',
                zIndex: 0,
                ...contextStyle,
                ...style,
              }}
              className={cn(contextClassName, activeClassName)}
              transition={itemTransition}
              layoutCrossfade={false}
              custom={handOff}
              variants={fade}
              initial={handedTo ? false : 'hidden'}
              animate="shown"
              exit="hidden"
              {...dataAttributes}
            />
          )}
        </AnimatePresence>
      )}

      {React.cloneElement(element, {
        style: { position: 'relative', zIndex: 1, ...element.props.style },
        className: element.props.className,
        ...getNonOverridingDataAttributes(element, {
          ...dataAttributes,
          'data-slot': 'motion-highlight-item',
        }),
      })}
    </Component>
  ) : (
    children
  );
}

export {
  Highlight,
  HighlightItem,
  useHighlight,
  type HighlightProps,
  type HighlightItemProps,
};
