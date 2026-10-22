'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

const collapsed = {
  height: 0,
  marginTop: 'var(--animate-ui-panel-shut-margin, 0px)',
  opacity: 0,
  filter: motionTokens.blur.disclosure,
};
const expanded = {
  height: 'auto',
  marginTop: 'var(--animate-ui-panel-margin, 0px)',
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' },
};

const CONTENT_VAR = '--animate-ui-panel-content';
const OPEN_MARGIN_VAR = '--animate-ui-panel-margin';
const SHUT_MARGIN_VAR = '--animate-ui-panel-shut-margin';

const EDGE_MASK = `linear-gradient(to bottom, black max(100% - 16px, 200% - var(${CONTENT_VAR}, 100%)), transparent)`;

const panelStyle = {
  overflow: 'hidden',
  maskImage: EDGE_MASK,
  WebkitMaskImage: EDGE_MASK,
} as const;

function measurePanel(element: HTMLElement | null) {
  element?.style.setProperty(CONTENT_VAR, `${element.scrollHeight}px`);
}

function releasePanel(element: HTMLElement | null) {
  element?.style.removeProperty(CONTENT_VAR);
}

/** A closed panel takes back the gap its parent's column leaves for it, so the gap shrinks with it. */
function fitGap(element: HTMLElement | null | undefined) {
  const parent = element?.parentElement;
  if (!element || !parent) return;
  const style = getComputedStyle(parent);
  const column =
    style.display.endsWith('grid') ||
    (style.display.endsWith('flex') &&
      style.flexDirection.startsWith('column'));
  const gap =
    column && parent.childElementCount > 1 ? parseFloat(style.rowGap) || 0 : 0;
  const inline = element.style.marginTop;
  element.style.marginTop = '';
  const own = parseFloat(getComputedStyle(element).marginTop) || 0;
  element.style.marginTop = inline;
  element.style.setProperty(OPEN_MARGIN_VAR, `${own}px`);
  element.style.setProperty(SHUT_MARGIN_VAR, `${own - gap}px`);
}

const DISCLOSURE_TRANSITION: Transition = motionTokens.transition.disclosure;

const INSTANT: Transition = { duration: 0 };

type HiddenMode = 'until-found' | false;

function useDisclosureTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  revealedByFind = false,
) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? DISCLOSURE_TRANSITION);
  const exit = useTempoTransition(
    exitTransition ?? transition ?? DISCLOSURE_TRANSITION,
  );
  const instantMoves = (t: Transition): Transition =>
    reduce ? { ...t, height: INSTANT, marginTop: INSTANT } : t;
  return {
    enter: revealedByFind ? INSTANT : instantMoves(enter),
    exit: instantMoves(exit),
  };
}

function useDisclosurePanel(
  open: boolean,
  hiddenMode: HiddenMode,
  sizeVars?: readonly string[],
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [settled, setSettled] = React.useState(!open);
  const [revealedByFind, setRevealedByFind] = React.useState(false);
  if (open && settled) setSettled(false);

  const visible = open || !settled;
  const vars = sizeVars?.join(' ');

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    fitGap(element);
    if (!visible) {
      if (hiddenMode === 'until-found')
        element.setAttribute('hidden', 'until-found');
      return undefined;
    }
    const names = vars ? vars.split(' ') : [];
    const hold = () => {
      if (element.hasAttribute('hidden')) element.removeAttribute('hidden');
      for (const name of names) {
        if (element.style.getPropertyValue(name) !== 'auto')
          element.style.setProperty(name, 'auto');
      }
    };
    hold();
    const observer = new MutationObserver(hold);
    observer.observe(element, {
      attributes: true,
      attributeFilter: names.length ? ['hidden', 'style'] : ['hidden'],
    });
    return () => observer.disconnect();
  }, [visible, hiddenMode, vars]);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || hiddenMode !== 'until-found') return undefined;
    // eslint-disable-next-line @eslint-react/dom-no-flush-sync
    const onBeforeMatch = () => flushSync(() => setRevealedByFind(true));
    element.addEventListener('beforematch', onBeforeMatch, { capture: true });
    return () =>
      element.removeEventListener('beforematch', onBeforeMatch, {
        capture: true,
      });
  }, [hiddenMode]);

  const onAnimationStart = () => measurePanel(ref.current);

  const onAnimationComplete = () => {
    if (!open) return setSettled(true);
    releasePanel(ref.current);
    if (revealedByFind) setRevealedByFind(false);
  };

  return {
    ref,
    visible,
    settled,
    revealedByFind,
    onAnimationStart,
    onAnimationComplete,
  };
}

function setRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => refs.forEach((ref) => setRef(ref, node));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ElementType<any>;

const motionComponents = new Map<AnyComponent, AnyComponent>();

function motionFor(type: AnyComponent): AnyComponent {
  let component = motionComponents.get(type);
  if (!component) {
    component = motion.create(type as React.ElementType);
    motionComponents.set(type, component);
  }
  return component;
}

type ElementProps = Record<string, unknown> & {
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
};

type MotionPanelProps = Record<string, unknown> & {
  ref: React.Ref<HTMLDivElement>;
  style: React.CSSProperties;
};

function asMotion(element: React.ReactElement, props: MotionPanelProps) {
  const own = element.props as ElementProps;
  const Component = motionFor(element.type as AnyComponent);
  return (
    <Component
      {...own}
      {...props}
      ref={mergeRefs(own.ref, props.ref)}
      style={{ ...own.style, ...props.style }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderFunction = (props: any, state: any) => React.ReactElement;
type RenderProp = React.ReactElement | RenderFunction | undefined;

function motionRender<T extends RenderProp>(
  render: T,
  props: MotionPanelProps,
) {
  if (typeof render === 'function') {
    const fn: RenderFunction = (renderProps, state) =>
      asMotion(render(renderProps, state), props);
    return fn as T;
  }
  if (render) return asMotion(render, props) as T;
  return (<motion.div {...props} />) as T;
}

type PanelAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type BaseUIPanelProps = PanelAnimationProps & {
  keepMounted?: boolean | undefined;
  hiddenUntilFound?: boolean | undefined;
  render?: RenderProp;
  style?: unknown;
};

function BaseUIPanel<P extends BaseUIPanelProps>({
  component: Panel,
  open,
  sizeVars,
  keepMounted,
  hiddenUntilFound,
  transition,
  exitTransition,
  render,
  ...props
}: P & {
  component: React.ComponentType<P>;
  open: boolean;
  sizeVars: [height: string, width: string];
}) {
  const untilFound = hiddenUntilFound ?? false;
  const persistent = untilFound || (keepMounted ?? false);
  const panel = useDisclosurePanel(open, untilFound ? 'until-found' : false);
  const { enter, exit } = useDisclosureTransitions(
    transition,
    exitTransition,
    panel.revealedByFind,
  );

  const motionProps: MotionPanelProps = {
    ref: panel.ref,
    initial: collapsed,
    animate: open
      ? { ...expanded, transition: enter }
      : { ...collapsed, transition: exit },
    exit: { ...collapsed, transition: exit },
    onAnimationStart: panel.onAnimationStart,
    onAnimationComplete: panel.onAnimationComplete,
    inert: !open && !(untilFound && panel.settled),
    style: {
      ...panelStyle,
      [sizeVars[0]]: 'auto',
      [sizeVars[1]]: 'auto',
    },
  };

  const panelProps = {
    ...props,
    keepMounted: true,
    hiddenUntilFound: untilFound,
    hidden: persistent && !untilFound && !open && panel.settled,
    render: motionRender(render, motionProps),
  } as unknown as P;

  return (
    <AnimatePresence>
      {(open || persistent) && <Panel {...panelProps} />}
    </AnimatePresence>
  );
}

export {
  fitGap,
  collapsed,
  expanded,
  panelStyle,
  measurePanel,
  releasePanel,
  useDisclosurePanel,
  useDisclosureTransitions,
  asMotion,
  BaseUIPanel,
  type HiddenMode,
  type MotionPanelProps,
  type PanelAnimationProps,
};
