'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../utils/motion';

// Shared by the Base UI Collapsible and Accordion panels and React Aria's
// DisclosurePanel: the libraries hide a closed panel the moment it closes,
// these helpers keep it visible until Motion's exit is over.

// Height is one of the few layout animations worth its cost: the content
// pushes what follows, so it has to grow.
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

type HiddenMode = 'until-found' | false;

/**
 * Under reduced motion the height jumps and only the fade plays. Motion
 * applies its reduced-motion setting when an element mounts; a panel that
 * stays mounted (React Aria, keepMounted) must also follow a preference
 * changed later, so the height's duration is zeroed here too.
 */
function useDisclosureTransitions(
  transition: Transition | undefined,
  exitTransition: Transition | undefined,
  revealedByFind: boolean,
) {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const instantHeight = (t: Transition): Transition =>
    reduce ? { ...t, height: { duration: 0 } } : t;
  return {
    // Find-in-page reveals the match at once, as the libraries do.
    enter: revealedByFind
      ? tokens.transition.instant
      : instantHeight(transition ?? tokens.transition.disclosure),
    exit: instantHeight(exitTransition ?? tokens.transition.exit),
  };
}

/**
 * State of a panel that may stay mounted while closed.
 *
 * - `visible` is true while open and during the exit.
 * - The library's `hidden` attribute is held off while visible (Base UI and
 *   React Aria set it from effects as soon as the panel closes), then
 *   `hidden="until-found"` is restored once the exit is over.
 * - A panel revealed by the browser's find-in-page (`beforematch`) opens
 *   instantly, as the libraries do.
 * - `sizeVars`: measured size variables the library writes on the element by
 *   hand (React Aria), held at `auto` while visible: Motion owns the size.
 */
function useDisclosurePanel(
  open: boolean,
  hiddenMode: HiddenMode,
  sizeVars?: readonly string[],
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [settled, setSettled] = React.useState(!open);
  const [revealedByFind, setRevealedByFind] = React.useState(false);
  // Reopening during the exit: the panel is visible again right away.
  if (open && settled) setSettled(false);

  const visible = open || !settled;
  const vars = sizeVars?.join(' ');

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!visible) {
      // React only renders a boolean `hidden`: set the string value by hand.
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
    // Capture: runs before the library's own listener opens the panel, and
    // flushSync commits it first (React Aria opens it in a flushSync too).
    // eslint-disable-next-line @eslint-react/dom-no-flush-sync
    const onBeforeMatch = () => flushSync(() => setRevealedByFind(true));
    element.addEventListener('beforematch', onBeforeMatch, { capture: true });
    return () =>
      element.removeEventListener('beforematch', onBeforeMatch, {
        capture: true,
      });
  }, [hiddenMode]);

  const onAnimationComplete = () => {
    if (!open) setSettled(true);
    else if (revealedByFind) setRevealedByFind(false);
  };

  return { ref, visible, settled, revealedByFind, onAnimationComplete };
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

/** The `motion` version of an element type, created once per type. */
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

/** Makes the element a user passed to Base UI's `render` animatable. */
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

/**
 * Base UI's `render` prop for an animated panel: a `motion.div` by default,
 * or the user's own `render` element made animatable.
 */
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

/** Animate UI's additions to a disclosure panel. */
type PanelAnimationProps = {
  /** Transition of the opening. Defaults to `transition.disclosure` (600ms). */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

type BaseUIPanelProps = PanelAnimationProps & {
  keepMounted?: boolean | undefined;
  hiddenUntilFound?: boolean | undefined;
  render?: RenderProp;
  style?: unknown;
};

/**
 * A Base UI Collapsible.Panel or Accordion.Panel animated with Motion. Base UI
 * keeps it mounted (`keepMounted`) so the exit can play; without the user's
 * `keepMounted`/`hiddenUntilFound`, AnimatePresence unmounts it afterwards.
 */
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
  /** The library's measured size variables, neutralized to `auto`. */
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
    // Transitions live in the targets: an exiting element keeps the props of
    // its last render, when it was still open.
    animate: open
      ? { ...expanded, transition: enter }
      : { ...collapsed, transition: exit },
    exit: { ...collapsed, transition: exit },
    onAnimationComplete: panel.onAnimationComplete,
    // Closed but still in the DOM: out of the tab order and the accessibility
    // tree. Not once hidden until found, or find-in-page would skip it.
    inert: !open && !(untilFound && panel.settled),
    style: {
      overflow: 'hidden',
      // Base UI measures these for CSS transitions; Motion owns the height
      // now, so classes reading them follow the content.
      [sizeVars[0]]: 'auto',
      [sizeVars[1]]: 'auto',
    },
  };

  const panelProps = {
    ...props,
    // Base UI unmounts or hides the panel as soon as it closes: it stays
    // mounted and visible until the exit is over.
    keepMounted: true,
    hiddenUntilFound: untilFound,
    hidden: persistent && !untilFound && !open && panel.settled,
    render: motionRender(render, motionProps),
  } as unknown as P;

  return (
    <AnimatePresence initial={false}>
      {(open || persistent) && <Panel {...panelProps} />}
    </AnimatePresence>
  );
}

export {
  collapsed,
  expanded,
  useDisclosurePanel,
  useDisclosureTransitions,
  asMotion,
  BaseUIPanel,
  type HiddenMode,
  type MotionPanelProps,
  type PanelAnimationProps,
};
