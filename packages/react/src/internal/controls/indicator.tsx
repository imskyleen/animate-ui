'use client';

import * as React from 'react';
import {
  animate,
  AnimatePresence,
  motionValue,
  PresenceContext,
  usePresence,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

// Checkmarks and radio dots, as Animate UI v1's. The check draws itself: its
// stroke (`pathLength`) and its opacity go from 0 to 1 in 0.3s, after 0.2s,
// and back in 0.3s when cleared (v1's `CheckboxIndicator`, drawn a little
// slower than its 0.2s). The dot pops:
// its scale and opacity spring from 0 (stiffness 200, damping 16), and back
// to 0 when it leaves (v1's `RadioGroupIndicator`).
//
// The library element (the indicator) never moves: its content (the icon,
// the dot) animates. Animating the content instead of the indicator matters
// for radio dots, which shadcn/ui positions with `absolute top-1/2 left-1/2`:
// a transform on the indicator would make it their containing block and
// shift them by a pixel.

/** What the indicator shows: a check (drawn) or a dot (popped). */
type IndicatorKind = 'check' | 'dot';

/** Animation props of the animated indicator parts. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check (or dot) appearing. Check: 0.3s after 0.2s.
   * Dot: a spring (stiffness 200, damping 16).
   */
  transition?: Transition;
  /**
   * Transition of the check (or dot) leaving. Check: 0.3s. Dot: the same
   * spring as it appears.
   */
  exitTransition?: Transition;
};

/** The check draws in 0.3s, after 0.2s, on Motion's easeOut (v1's curve). */
const CHECK_TRANSITION: Transition = motionTokens.transition.check;
/** The check erases in 0.3s, on Motion's easeOut (v1's curve). */
const CHECK_EXIT_TRANSITION: Transition = motionTokens.transition.uncheck;
/** v1's `RadioGroupIndicator` / `RadioIndicator`, in and out: bouncy. */
const DOT_TRANSITION: Transition = motionTokens.spring.bounce;

/** The v1 transitions of an indicator, with the part's overrides. */
function useIndicatorTransitions(
  kind: IndicatorKind,
  { transition, exitTransition }: IndicatorAnimationProps,
) {
  const enter = useTempoTransition(
    transition ?? (kind === 'check' ? CHECK_TRANSITION : DOT_TRANSITION),
  );
  const exit = useTempoTransition(
    exitTransition ?? (kind === 'check' ? CHECK_EXIT_TRANSITION : enter),
  );
  return { enter, exit };
}

// ---------------------------------------------------------------------------
// Content: each animated element has a progress (0 hidden, 1 shown) that the
// writers below turn into styles.

/** SVG shapes a check is drawn with. */
const SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';

type Drawn = {
  /** stroke: an SVG shape drawn; fade: anything else; pop: a dot. */
  mode: 'stroke' | 'fade' | 'pop';
  progress: MotionValue<number>;
  /** Its opacity at rest (its own, from its styles). */
  opacity: number;
  /** Its inline opacity, restored at rest. */
  inlineOpacity: string;
  /** Its own dash attributes, restored when fully drawn. */
  dash: (string | null)[];
  reduce: boolean;
  controls: AnimationPlaybackControls | null;
};

const drawn = new WeakMap<Element, Drawn>();
/** Exit copies of content React already removed (React Aria). */
const ghosts = new WeakSet<Element>();

const DASH_ATTRIBUTES = ['pathLength', 'stroke-dasharray', 'stroke-dashoffset'];

type Styled = Element & ElementCSSInlineStyle;

/** Writes progress `p` (0 hidden, 1 shown) on `el`. At 1: as rendered. */
function write(el: Styled, d: Drawn, p: number) {
  const atRest = p === 1;
  if (d.mode === 'stroke') {
    if (atRest || d.reduce) {
      DASH_ATTRIBUTES.forEach((name, i) => {
        const value = d.dash[i];
        if (value === null || value === undefined) el.removeAttribute(name);
        else el.setAttribute(name, value);
      });
    } else {
      el.setAttribute('pathLength', '1');
      el.setAttribute('stroke-dasharray', `${Math.min(1, Math.max(0, p))} 1`);
      el.setAttribute('stroke-dashoffset', '0');
    }
  }
  if (d.mode === 'pop')
    el.style.transform = atRest || d.reduce ? '' : `scale(${p})`;
  // A spring past 1 (the dot) overshoots its opacity too: clamped, as v1's.
  el.style.opacity = atRest ? d.inlineOpacity : String(d.opacity * p);
}

/** The elements that animate, for the content elements of an indicator. */
function targetsOf(content: Element[], kind: IndicatorKind): Styled[] {
  if (kind === 'dot') return content as Styled[];
  return content.flatMap((el) => {
    const shapes = el.matches(SHAPES)
      ? [el]
      : Array.from(el.querySelectorAll(SHAPES));
    return (shapes.length > 0 ? shapes : [el]) as Styled[];
  });
}

function stateOf(el: Styled, kind: IndicatorKind, reduce: boolean): Drawn {
  let d = drawn.get(el);
  if (!d) {
    d = {
      mode:
        kind === 'dot'
          ? 'pop'
          : el instanceof SVGGeometryElement
            ? 'stroke'
            : 'fade',
      progress: motionValue(1),
      opacity: Number(getComputedStyle(el).opacity),
      inlineOpacity: el.style.opacity,
      dash: DASH_ATTRIBUTES.map((name) => el.getAttribute(name)),
      reduce,
      controls: null,
    };
    const state = d;
    d.progress.on('change', (p) => write(el, state, p));
    drawn.set(el, d);
  }
  d.reduce = reduce;
  return d;
}

/** Animates `targets` to shown (1) or hidden (0). Fresh ones start hidden. */
function animateTo(
  targets: Styled[],
  kind: IndicatorKind,
  shown: boolean,
  transition: Transition,
  reduce: boolean,
): Promise<void> {
  const runs = targets.map((el) => {
    const fresh = !drawn.has(el);
    const d = stateOf(el, kind, reduce);
    d.controls?.stop();
    // Content seen for the first time is hidden on this very frame (no flash
    // before the animation starts).
    if (fresh && shown) d.progress.jump(0);
    const controls = animate(d.progress, shown ? 1 : 0, transition);
    d.controls = controls;
    return controls;
  });
  return Promise.all(runs).then(() => undefined);
}

/** Puts `targets` at rest, shown or hidden, at once. */
function setNow(
  targets: Styled[],
  kind: IndicatorKind,
  shown: boolean,
  reduce: boolean,
) {
  for (const el of targets) {
    const d = stateOf(el, kind, reduce);
    d.controls?.stop();
    d.controls = null;
    if (d.progress.get() === (shown ? 1 : 0)) write(el, d, shown ? 1 : 0);
    else d.progress.jump(shown ? 1 : 0);
  }
}

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
      return undefined;
    });
    return () => {
      cleanups.forEach((cleanup, i) => {
        const ref = refs[i];
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      });
    };
  };
}

/** The indicator's element children (its content), copies left out. */
function contentOf(indicator: Element) {
  return Array.from(indicator.children).filter((child) => !ghosts.has(child));
}

// ---------------------------------------------------------------------------
// Radix UI and Base UI: the part renders the indicator.

type IndicatorContentProps = React.ComponentPropsWithRef<'span'> &
  IndicatorAnimationProps & {
    kind: IndicatorKind;
    /** The control is checked (or indeterminate). */
    checked: boolean;
    /** The check of an indeterminate control draws without the delay (v1). */
    indeterminate?: boolean;
  };

/**
 * The indicator element of Radix UI and Base UI controls, rendered inside
 * `AnimatePresence` by the part: shows its content when checked, and delays
 * its own unmount until the content has left. A force-mounted (kept-mounted)
 * indicator stays in the DOM with its content hidden.
 */
function IndicatorContent({
  kind,
  checked,
  indeterminate = false,
  transition,
  exitTransition,
  ref,
  style,
  ...props
}: IndicatorContentProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  // v1 animated content already there on mount (its `initial` was the
  // hidden state): a checked box draws its check, a selected radio pops its
  // dot. Not inside an `AnimatePresence initial={false}`.
  const animateOnMount = React.use(PresenceContext)?.initial !== false;
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions(kind, {
    transition,
    exitTransition,
  });
  const visible = checked && isPresent;
  const lastRef = React.useRef<{
    visible: boolean;
    indeterminate: boolean;
    content: Element[];
  } | null>(null);
  const runRef = React.useRef(0);
  // Hidden until the first layout effect, so a server-rendered page doesn't
  // show the content before it animates in (or while it should be hidden).
  const [hideFirst] = React.useState(() => !checked || animateOnMount);

  React.useLayoutEffect(() => {
    const element = localRef.current;
    const last = lastRef.current;
    if (!element) {
      if (!isPresent) safeToRemove?.();
      return;
    }
    const content = contentOf(element);
    lastRef.current = { visible, indeterminate, content };
    const targets = targetsOf(content, kind);
    const enterTransition = indeterminate ? { ...enter, delay: 0 } : enter;

    if (!last) {
      if (!visible) setNow(targets, kind, false, reduce);
      else if (animateOnMount)
        void animateTo(targets, kind, true, enterTransition, reduce);
      else setNow(targets, kind, true, reduce);
      element.style.opacity = '';
      return;
    }
    if (last.visible === visible) {
      // Same state, new content (an icon swapped for the indeterminate one):
      // the new content draws in.
      const fresh = targets.filter((el) => !drawn.has(el));
      if (visible && fresh.length > 0)
        void animateTo(fresh, kind, true, enterTransition, reduce);
      return;
    }
    const id = ++runRef.current;
    if (visible) {
      void animateTo(targets, kind, true, enterTransition, reduce);
      return;
    }
    void animateTo(targets, kind, false, exit, reduce).then(() => {
      if (runRef.current === id && !isPresent) safeToRemove?.();
    });
  });

  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  return (
    <span
      {...props}
      style={hideFirst ? { ...style, opacity: 0 } : style}
      ref={mergedRef}
    />
  );
}

type IndicatorPresenceProps = IndicatorContentProps & {
  /** Keep the indicator mounted while unchecked (`forceMount`, `keepMounted`). */
  keepMounted?: boolean;
};

/** Mounts the indicator while checked, and keeps it until its content left. */
function IndicatorPresence({ keepMounted, ...props }: IndicatorPresenceProps) {
  return (
    <AnimatePresence>
      {(props.checked || keepMounted) && (
        <IndicatorContent key="indicator" {...props} />
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// React Aria: the user renders the indicator.

/**
 * React Aria renders the indicator itself (shadcn/ui:
 * `<span data-slot="checkbox-indicator">{isSelected && <CheckIcon />}</span>`),
 * so the content mounts and unmounts with the state. Mounted content animates
 * in; removed content leaves through a copy put back for its exit, React's
 * tree is never touched. Content there on mount stays at rest: it is the
 * user's markup, rendered by the server before any script runs.
 */
function useRenderedIndicator(
  rootRef: React.RefObject<Element | null>,
  selector: string,
  kind: IndicatorKind,
  {
    checked,
    indeterminate = false,
  }: { checked: boolean; indeterminate?: boolean },
  animation: IndicatorAnimationProps,
) {
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions(kind, animation);
  const lastRef = React.useRef<{
    checked: boolean;
    content: Element[];
  } | null>(null);

  React.useLayoutEffect(() => {
    const indicator = rootRef.current?.querySelector(selector) ?? null;
    const content = indicator ? contentOf(indicator) : [];
    const previous = lastRef.current;
    lastRef.current = { checked, content };
    const enterTransition = indeterminate ? { ...enter, delay: 0 } : enter;
    if (!previous) {
      setNow(targetsOf(content, kind), kind, true, reduce);
      return;
    }
    if (!indicator) return;
    if (previous.checked === checked) {
      // Same state, new content: it animates in.
      const fresh = targetsOf(content, kind).filter((el) => !drawn.has(el));
      if (checked && fresh.length > 0)
        void animateTo(fresh, kind, true, enterTransition, reduce);
      return;
    }

    if (checked) {
      // Re-checked during an exit: the copies go at once.
      Array.from(indicator.children)
        .filter((child) => ghosts.has(child))
        .forEach((ghost) => ghost.remove());
      void animateTo(
        targetsOf(content, kind),
        kind,
        true,
        enterTransition,
        reduce,
      );
      return;
    }

    const kept = previous.content.filter((child) => child.isConnected);
    const copies = previous.content
      .filter((child) => !child.isConnected)
      .map((child) => {
        const copy = child.cloneNode(true) as Styled;
        ghosts.add(copy);
        copy.setAttribute('aria-hidden', 'true');
        copy.style.pointerEvents = 'none';
        indicator.appendChild(copy);
        return copy;
      });
    const exiting = targetsOf([...kept, ...copies], kind);
    // The copies start where the removed content was: shown.
    setNow(targetsOf(copies, kind), kind, true, reduce);
    void animateTo(exiting, kind, false, exit, reduce).then(() =>
      copies.forEach((copy) => copy.remove()),
    );
  });
}

export {
  CHECK_TRANSITION,
  CHECK_EXIT_TRANSITION,
  DOT_TRANSITION,
  IndicatorContent,
  IndicatorPresence,
  useRenderedIndicator,
  mergeRefs,
  type IndicatorKind,
  type IndicatorAnimationProps,
  type IndicatorContentProps,
  type IndicatorPresenceProps,
};
