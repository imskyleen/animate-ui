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
  type CheckAnimation,
} from '../../utils/motion';

// Checkmarks and radio dots, as Animate UI v1's. A check shows the way its
// `CheckAnimation` says:
//
// - `draw` (the default, v1's `CheckboxIndicator`): its stroke (`pathLength`)
//   and its opacity go from 0 to 1 in 0.3s, after 0.2s, and back in 0.3s when
//   cleared (drawn a little slower than v1's 0.2s);
// - `pop`: it springs in from half its size out of a 2px blur (stiffness 500,
//   damping 24), after the same 0.2s, and shrinks back into its blur in
//   0.15s.
//
// The dot pops: its scale and opacity spring from 0 (stiffness 200, damping
// 16), and back to 0 when it leaves (v1's `RadioGroupIndicator`).
//
// The library element (the indicator) never moves: its content (the icon,
// the dot) animates. Animating the content instead of the indicator matters
// for radio dots, which shadcn/ui positions with `absolute top-1/2 left-1/2`:
// a transform on the indicator would make it their containing block and
// shift them by a pixel.

/** What the indicator shows: a check or a dot (popped). */
type IndicatorKind = 'check' | 'dot';

/** Animation props of the animated indicator parts. */
type IndicatorAnimationProps = {
  /**
   * Transition of the check (or dot) appearing. Check: 0.3s after 0.2s
   * (drawn), or a spring (stiffness 500, damping 24) after 0.2s (popped).
   * Dot: a spring (stiffness 200, damping 16).
   */
  transition?: Transition;
  /**
   * Transition of the check (or dot) leaving. Check: 0.3s (erased), or 0.15s
   * (popped). Dot: the same spring as it appears.
   */
  exitTransition?: Transition;
};

/** Animate UI's choice of animation, on the parts that show a check. */
type CheckAnimationProps = {
  /**
   * How the check shows and hides: `draw` (it draws itself and erases
   * itself) or `pop` (it pops in from half its size and shrinks back out).
   * Defaults to the closest `AnimateUIProvider`'s `checkAnimation`, or
   * `draw`.
   */
  animation?: CheckAnimation;
};

/** The check draws in 0.3s, after 0.2s, on Motion's easeOut (v1's curve). */
const CHECK_TRANSITION: Transition = motionTokens.transition.check;
/** The check erases in 0.3s, on Motion's easeOut (v1's curve). */
const CHECK_EXIT_TRANSITION: Transition = motionTokens.transition.uncheck;
/** A popped check springs in once the box has answered, like a drawn one. */
const POP_TRANSITION: Transition = {
  ...motionTokens.spring.checkPop,
  delay: motionTokens.transition.check.delay,
};
/** A popped check shrinks back out, quicker. */
const POP_EXIT_TRANSITION: Transition = motionTokens.transition.popOut;
/** v1's `RadioGroupIndicator` / `RadioIndicator`, in and out: bouncy. */
const DOT_TRANSITION: Transition = motionTokens.spring.bounce;

/** A popped check, hidden: half its size, in a light blur. */
const POP_FROM = motionTokens.scale.icon;
const POP_BLUR = 2;

/** The transitions of an indicator, with the part's overrides. */
function useIndicatorTransitions(
  kind: IndicatorKind,
  animation: CheckAnimation,
  { transition, exitTransition }: IndicatorAnimationProps,
) {
  const [enterDefault, exitDefault] =
    kind === 'dot'
      ? [DOT_TRANSITION, DOT_TRANSITION]
      : animation === 'pop'
        ? [POP_TRANSITION, POP_EXIT_TRANSITION]
        : [CHECK_TRANSITION, CHECK_EXIT_TRANSITION];
  const enter = useTempoTransition(transition ?? enterDefault);
  // A dot leaves the way it came: its `transition` covers both.
  const exit = useTempoTransition(
    exitTransition ??
      (kind === 'dot' ? (transition ?? exitDefault) : exitDefault),
  );
  return { enter, exit };
}

// ---------------------------------------------------------------------------
// Content: each animated element has a progress (0 hidden, 1 shown) that the
// writers below turn into styles.

/** SVG shapes a check is drawn with. */
const SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';

type Drawn = {
  /**
   * stroke: an SVG shape drawn; fade: anything else drawn (text); pop: a dot,
   * or a popped check.
   */
  mode: 'stroke' | 'fade' | 'pop';
  /** pop: its scale when hidden (0 for a dot, 0.5 for a check). */
  from: number;
  /** pop: its blur when hidden, in px. */
  blur: number;
  progress: MotionValue<number>;
  /** Its opacity at rest (its own, from its styles). */
  opacity: number;
  /** Its inline styles, restored at rest. */
  inlineOpacity: string;
  inlineTransform: string;
  inlineFilter: string;
  /** Its own dash attributes, restored when fully drawn. */
  dash: (string | null)[];
  reduce: boolean;
  controls: AnimationPlaybackControls | null;
  /** Stops writing its progress. */
  unsubscribe: () => void;
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
  if (d.mode === 'pop') {
    // A hidden check needs neither: no scaled, blurred layer for each check
    // kept mounted on a list's items. (A dot, from 0, keeps its scale.)
    const plain = atRest || d.reduce || (p === 0 && d.blur > 0);
    el.style.transform = plain
      ? d.inlineTransform
      : `scale(${d.from + (1 - d.from) * p})`;
    if (d.blur)
      el.style.filter = plain
        ? d.inlineFilter
        : `blur(${d.blur * (1 - Math.min(1, Math.max(0, p)))}px)`;
  }
  // A spring past 1 overshoots its opacity too: clamped, as v1's.
  el.style.opacity = atRest
    ? d.inlineOpacity
    : String(d.opacity * Math.min(1, Math.max(0, p)));
}

/** How an indicator's content animates. */
type Look = { kind: IndicatorKind; animation: CheckAnimation };

const pops = ({ kind, animation }: Look) =>
  kind === 'dot' || animation === 'pop';

/**
 * The elements that animate, for the content elements of an indicator: the
 * shapes of a drawn check, the content itself when it pops.
 */
function targetsOf(content: Element[], look: Look): Styled[] {
  if (pops(look)) return content as Styled[];
  return content.flatMap((el) => {
    const shapes = el.matches(SHAPES)
      ? [el]
      : Array.from(el.querySelectorAll(SHAPES));
    return (shapes.length > 0 ? shapes : [el]) as Styled[];
  });
}

function stateOf(el: Styled, look: Look, reduce: boolean): Drawn {
  let d = drawn.get(el);
  if (!d) {
    const popped = pops(look);
    // A scale doesn't apply to an inline box (a text check's <span>).
    if (
      popped &&
      look.kind === 'check' &&
      el instanceof HTMLElement &&
      getComputedStyle(el).display === 'inline'
    )
      el.style.display = 'inline-block';
    d = {
      mode: popped
        ? 'pop'
        : el instanceof SVGGeometryElement
          ? 'stroke'
          : 'fade',
      from: look.kind === 'dot' ? 0 : POP_FROM,
      blur: look.kind === 'dot' ? 0 : POP_BLUR,
      progress: motionValue(1),
      opacity: Number(getComputedStyle(el).opacity),
      inlineOpacity: el.style.opacity,
      inlineTransform: el.style.transform,
      inlineFilter: el.style.filter,
      dash: DASH_ATTRIBUTES.map((name) => el.getAttribute(name)),
      reduce,
      controls: null,
      unsubscribe: () => {},
    };
    const state = d;
    d.unsubscribe = d.progress.on('change', (p) => write(el, state, p));
    drawn.set(el, d);
  }
  d.reduce = reduce;
  return d;
}

/**
 * Puts content back as rendered and forgets it: drawn, it may pop now (or
 * the other way around).
 */
function forget(content: Element[]) {
  for (const el of content) {
    for (const target of [el, ...Array.from(el.querySelectorAll(SHAPES))]) {
      const d = drawn.get(target);
      if (!d) continue;
      d.controls?.stop();
      d.unsubscribe();
      write(target as Styled, d, 1);
      drawn.delete(target);
    }
  }
}

/** Whether any of `targets` shows, even a little. */
const anyShown = (targets: Element[]) =>
  targets.some((el) => (drawn.get(el)?.progress.get() ?? 0) > 0);

/** Animates `targets` to shown (1) or hidden (0). Fresh ones start hidden. */
function animateTo(
  targets: Styled[],
  look: Look,
  shown: boolean,
  transition: Transition,
  reduce: boolean,
): Promise<void> {
  const runs = targets.map((el) => {
    const fresh = !drawn.has(el);
    const d = stateOf(el, look, reduce);
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
  look: Look,
  shown: boolean,
  reduce: boolean,
) {
  for (const el of targets) {
    const d = stateOf(el, look, reduce);
    d.controls?.stop();
    d.controls = null;
    if (d.progress.get() === (shown ? 1 : 0)) write(el, d, shown ? 1 : 0);
    else d.progress.jump(shown ? 1 : 0);
  }
}

/**
 * An indicator whose showing and hiding something else decides (a single
 * selection's check, gliding between the items of its group).
 */
type IndicatorHandle = {
  /** The indicator element. */
  element: HTMLElement;
  /** Shows or hides its content: animated, or at once. */
  toggle: (shown: boolean, animated: boolean) => void;
  /** Whether its content shows, even a little. */
  isShown: () => boolean;
};

/**
 * Called instead of animating when the indicator's content should show or
 * hide (or show as it mounts): the callee toggles it, before the next frame.
 */
type Coordinate = (handle: IndicatorHandle, shown: boolean) => void;

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
    /** The element to render (a `span` by default). */
    as?: 'span' | 'div';
    kind: IndicatorKind;
    /** How a check shows and hides (a dot always pops). */
    animation?: CheckAnimation;
    /** The control is checked (or indeterminate). */
    checked: boolean;
    /** The check of an indeterminate control shows without the delay (v1). */
    indeterminate?: boolean;
    /** Something else decides how its content shows and hides. */
    coordinate?: Coordinate;
    /**
     * Whether content checked on mount animates in (read in the mount's
     * layout effect when it's a function). Defaults to its presence's: not
     * inside an `AnimatePresence initial={false}`.
     */
    animateOnMount?: boolean | (() => boolean);
  };

/**
 * The indicator element of Radix UI and Base UI controls, rendered inside
 * `AnimatePresence` by the part: shows its content when checked, and delays
 * its own unmount until the content has left. A force-mounted (kept-mounted)
 * indicator stays in the DOM with its content hidden.
 */
function IndicatorContent({
  as: Element = 'span',
  kind,
  animation = 'draw',
  checked,
  indeterminate = false,
  transition,
  exitTransition,
  coordinate,
  animateOnMount: animateOnMountProp,
  ref,
  style,
  ...props
}: IndicatorContentProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  // A check or a dot only animates when it's checked or unchecked: content
  // checked on mount (the page loading, a dialog or a menu opening) is at
  // rest, unless it mounts because it was just checked (it's added to an
  // `AnimatePresence` already there, whose `initial` doesn't apply to it).
  const presenceInitial = React.use(PresenceContext)?.initial !== false;
  const animateOnMount = animateOnMountProp ?? presenceInitial;
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions(kind, animation, {
    transition,
    exitTransition,
  });
  const visible = checked && isPresent;
  const lastRef = React.useRef<{
    visible: boolean;
    animation: CheckAnimation;
    content: Element[];
  } | null>(null);
  const runRef = React.useRef(0);
  // Hidden until the first layout effect, so a server-rendered page doesn't
  // show the content before it animates in (or while it should be hidden).
  const [hideFirst] = React.useState(
    () => !checked || animateOnMount !== false,
  );

  React.useLayoutEffect(() => {
    const element = localRef.current;
    const last = lastRef.current;
    if (!element) {
      if (!isPresent) safeToRemove?.();
      return;
    }
    const content = contentOf(element);
    lastRef.current = { visible, animation, content };
    const look = { kind, animation };
    // Text alone (a "✓"): the indicator itself animates.
    const targets =
      content.length > 0 ? targetsOf(content, look) : [element as Styled];
    const enterTransition = indeterminate ? { ...enter, delay: 0 } : enter;
    const handle: IndicatorHandle = {
      element,
      toggle: (shown, animated) => {
        if (!animated) setNow(targets, look, shown, reduce);
        else
          void animateTo(
            targets,
            look,
            shown,
            shown ? enterTransition : exit,
            reduce,
          );
      },
      isShown: () => anyShown(targets),
    };

    if (!last) {
      // Shown before it animates (its content, or itself, starts hidden).
      element.style.opacity = '';
      const animated =
        typeof animateOnMount === 'function'
          ? animateOnMount()
          : animateOnMount;
      if (!visible || !animated) setNow(targets, look, visible, reduce);
      else if (coordinate) {
        setNow(targets, look, false, reduce);
        coordinate(handle, true);
      } else void animateTo(targets, look, true, enterTransition, reduce);
      return;
    }
    if (last.animation !== animation) {
      // Another animation: the content starts afresh, as it is.
      forget([element, ...last.content]);
      setNow(targets, look, visible, reduce);
      return;
    }
    if (last.visible === visible) {
      // Same state, new content (an icon swapped for the indeterminate one):
      // the new content shows itself in.
      const fresh = targets.filter((el) => !drawn.has(el));
      if (visible && fresh.length > 0)
        void animateTo(fresh, look, true, enterTransition, reduce);
      return;
    }
    const id = ++runRef.current;
    if (coordinate && isPresent) {
      coordinate(handle, visible);
      return;
    }
    if (visible) {
      void animateTo(targets, look, true, enterTransition, reduce);
      return;
    }
    void animateTo(targets, look, false, exit, reduce).then(() => {
      if (runRef.current === id && !isPresent) safeToRemove?.();
    });
  });

  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  return (
    <Element
      {...(props as React.ComponentProps<'span'>)}
      style={hideFirst ? { ...style, opacity: 0 } : style}
      ref={mergedRef}
    />
  );
}

type IndicatorPresenceProps = IndicatorContentProps & {
  /** Keep the indicator mounted while unchecked (`forceMount`, `keepMounted`). */
  keepMounted?: boolean;
};

/**
 * Mounts the indicator while checked, and keeps it until its content left.
 * Checked on mount, it's at rest: it animates when it's checked.
 */
function IndicatorPresence({ keepMounted, ...props }: IndicatorPresenceProps) {
  return (
    <AnimatePresence initial={false}>
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
    animation = 'draw',
  }: { checked: boolean; indeterminate?: boolean; animation?: CheckAnimation },
  transitions: IndicatorAnimationProps,
) {
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions(kind, animation, transitions);
  const lastRef = React.useRef<{
    checked: boolean;
    animation: CheckAnimation;
    content: Element[];
  } | null>(null);

  React.useLayoutEffect(() => {
    const indicator = rootRef.current?.querySelector(selector) ?? null;
    const content = indicator ? contentOf(indicator) : [];
    const previous = lastRef.current;
    lastRef.current = { checked, animation, content };
    const look = { kind, animation };
    const enterTransition = indeterminate ? { ...enter, delay: 0 } : enter;
    if (!previous) {
      setNow(targetsOf(content, look), look, true, reduce);
      return;
    }
    if (!indicator) return;
    if (previous.animation !== animation) {
      // Another animation: the content starts afresh, as it is.
      forget(previous.content);
      setNow(targetsOf(content, look), look, true, reduce);
      return;
    }
    if (previous.checked === checked) {
      // Same state, new content: it animates in.
      const fresh = targetsOf(content, look).filter((el) => !drawn.has(el));
      if (checked && fresh.length > 0)
        void animateTo(fresh, look, true, enterTransition, reduce);
      return;
    }

    if (checked) {
      // Re-checked during an exit: the copies go at once.
      Array.from(indicator.children)
        .filter((child) => ghosts.has(child))
        .forEach((ghost) => ghost.remove());
      void animateTo(
        targetsOf(content, look),
        look,
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
    const exiting = targetsOf([...kept, ...copies], look);
    // The copies start where the removed content was: shown.
    setNow(targetsOf(copies, look), look, true, reduce);
    void animateTo(exiting, look, false, exit, reduce).then(() =>
      copies.forEach((copy) => copy.remove()),
    );
  });
}

export {
  CHECK_TRANSITION,
  CHECK_EXIT_TRANSITION,
  POP_TRANSITION,
  POP_EXIT_TRANSITION,
  DOT_TRANSITION,
  IndicatorContent,
  IndicatorPresence,
  useRenderedIndicator,
  mergeRefs,
  animateTo,
  forget,
  targetsOf,
  type Look,
  type CheckAnimationProps,
  type Coordinate,
  type IndicatorHandle,
  type IndicatorKind,
  type IndicatorAnimationProps,
  type IndicatorContentProps,
  type IndicatorPresenceProps,
};
