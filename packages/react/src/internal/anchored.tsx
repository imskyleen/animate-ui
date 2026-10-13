'use client';

import * as React from 'react';
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

const POPOVER_TRANSITION = motionTokens.spring.pop;
const MENU_TRANSITION = motionTokens.transition.menu;
const MORPH_TRANSITION = motionTokens.spring.morph;

const HIDDEN_SCALE = {
  tooltip: motionTokens.scale.tooltip,
  popover: motionTokens.scale.popover,
  menu: motionTokens.scale.menu,
} as const;
const DEFAULT_TRANSITION = {
  tooltip: POPOVER_TRANSITION,
  popover: POPOVER_TRANSITION,
  menu: MENU_TRANSITION,
} as const;

type AnchoredKind = keyof typeof HIDDEN_SCALE;

type AnchoredAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type AnchoredMotionOptions = AnchoredAnimationProps & {
  kind?: AnchoredKind;
  open: boolean;
  keepMounted?: boolean;
  instant?: boolean;
};

type AnchoredMotionProps = {
  initial: false | TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  style?: React.CSSProperties;
  onAnimationComplete?: (definition: unknown) => void;
};

const WARM_WINDOW = 300;

const tooltipGroup = {
  open: new Set<symbol>(),
  warm: false,
  coolDown: undefined as ReturnType<typeof setTimeout> | undefined,
  leaving: new Map<symbol, () => void>(),
};

function useWarmTooltip(open: boolean, enabled: boolean) {
  const [id] = React.useState(() => Symbol('tooltip'));
  const [change, setChange] = React.useState(() => ({
    open,
    atOnce: enabled && open && tooltipGroup.warm,
  }));
  if (change.open !== open) {
    setChange({
      open,
      atOnce:
        enabled &&
        (open
          ? tooltipGroup.warm
          : [...tooltipGroup.open].some((other) => other !== id)),
    });
  }
  const [cut, setCut] = React.useState(false);
  if (open && cut) setCut(false);
  const atOnceRef = React.useRef(change.atOnce);
  React.useLayoutEffect(() => {
    atOnceRef.current = change.atOnce;
  });

  React.useEffect(() => {
    if (!enabled || !open) return;
    tooltipGroup.open.add(id);
    tooltipGroup.warm = true;
    clearTimeout(tooltipGroup.coolDown);
    if (atOnceRef.current)
      for (const hide of tooltipGroup.leaving.values()) hide();
    return () => {
      tooltipGroup.open.delete(id);
      if (tooltipGroup.open.size > 0) return;
      clearTimeout(tooltipGroup.coolDown);
      tooltipGroup.coolDown = setTimeout(() => {
        tooltipGroup.warm = false;
      }, WARM_WINDOW);
    };
  }, [enabled, open, id]);

  React.useEffect(() => {
    if (!enabled || open) return;
    tooltipGroup.leaving.set(id, () => setCut(true));
    return () => {
      tooltipGroup.leaving.delete(id);
    };
  }, [enabled, open, id]);

  return {
    appearAtOnce: open && change.atOnce,
    hideAtOnce: !open && (change.atOnce || cut),
  };
}

function useAnchoredMotion({
  kind = 'popover',
  open,
  keepMounted,
  instant,
  transition,
  exitTransition,
}: AnchoredMotionOptions): AnchoredMotionProps {
  const reduce = useShouldReduceMotion();
  const warmsUp = kind === 'tooltip' && instant === undefined;
  const warm = useWarmTooltip(open, warmsUp);
  const enter = useTempoTransition(transition ?? DEFAULT_TRANSITION[kind]);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? DEFAULT_TRANSITION[kind],
  );
  const hidden = { opacity: 0, scale: reduce ? 1 : HIDDEN_SCALE[kind] };
  const shown = { opacity: 1, scale: 1 };
  const none = { duration: 0 };

  const [settledClosed, setSettledClosed] = React.useState(
    Boolean(keepMounted) && !open,
  );
  if (open && settledClosed) setSettledClosed(false);

  const appearAtOnce = instant || warm.appearAtOnce;

  return {
    initial: appearAtOnce || !open ? false : hidden,
    animate: open
      ? {
          ...shown,
          transition: appearAtOnce ? none : enter,
          ...(keepMounted && { visibility: 'visible' }),
        }
      : {
          ...hidden,
          transition: instant ? none : leave,
          ...(keepMounted && settledClosed && { visibility: 'hidden' }),
        },
    exit: { ...hidden, transition: instant ? none : leave },
    style: warm.hideAtOnce ? { visibility: 'hidden' } : undefined,
    onAnimationComplete: keepMounted
      ? (definition) => {
          const target = definition as { opacity?: number };
          if (!open && target.opacity === 0) setSettledClosed(true);
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = string | React.ComponentType<any>;
const motionComponents = new Map<AnyComponent, AnyComponent>();

function motionFor(type: AnyComponent): AnyComponent {
  let component = motionComponents.get(type);
  if (!component) {
    component =
      typeof type === 'string'
        ? (motion as unknown as Record<string, AnyComponent>)[type]!
        : (motion.create(type) as AnyComponent);
    motionComponents.set(type, component);
  }
  return component;
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

type ElementProps = {
  ref?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
} & Record<string, unknown>;

function asMotion(element: React.ReactElement, props: ElementProps) {
  const own = element.props as ElementProps;
  const Component = motionFor(
    element.type as AnyComponent,
  ) as React.ElementType;
  return (
    <Component
      {...own}
      {...props}
      ref={mergeRefs(own.ref, props.ref)}
      style={{ ...own.style, ...props.style }}
    />
  );
}

export {
  useAnchoredMotion,
  asMotion,
  mergeRefs,
  POPOVER_TRANSITION,
  MENU_TRANSITION,
  MORPH_TRANSITION,
  HIDDEN_SCALE,
  type AnchoredKind,
  type AnchoredAnimationProps,
  type AnchoredMotionProps,
};
