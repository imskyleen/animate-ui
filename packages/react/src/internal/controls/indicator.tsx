'use client';

import * as React from 'react';
import {
  animate,
  AnimatePresence,
  PresenceContext,
  usePresence,
  type Transition,
} from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../utils/motion';

// Checkmarks and radio dots. The library element (the indicator) never moves:
// its content (the icon, the dot) scales in. Animating the content instead of
// the indicator matters for radio dots, which shadcn/ui positions with
// `absolute top-1/2 left-1/2`: a transform on the indicator would make it
// their containing block and shift them by a pixel.

/**
 * Small glyphs need more travel than panels to read: they start at half size
 * (never 0) and fade in.
 */
const CONTENT_FROM = 0.5;

/** Animation props of the animated indicator parts. */
type IndicatorAnimationProps = {
  /** Transition of the check (or dot) appearing. Defaults to `transition.change` (600ms). */
  transition?: Transition;
  /** Transition of the check (or dot) leaving. Defaults to `transition.exit` (400ms). */
  exitTransition?: Transition;
};

type Styled = HTMLElement | SVGElement;

const shown = { opacity: 1, transform: 'scale(1)' };
const hidden = (reduce: boolean) => ({
  opacity: 0,
  transform: `scale(${reduce ? 1 : CONTENT_FROM})`,
});

/**
 * Radio groups select with the arrow keys: that's keyboard navigation, so the
 * dots swap at once (Space, Enter and pointers still animate). The group
 * records the last input in a ref its indicators read when they animate.
 */
const KeyboardSelectionContext =
  React.createContext<React.RefObject<boolean> | null>(null);

const NAVIGATION_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/**
 * For a radio group's root: tracks whether the next selection comes from
 * keyboard navigation. Returns the ref to provide and the root's capture
 * handlers, composed with the user's.
 */
function useKeyboardSelection<K extends { key: string }, P>(
  onKeyDownCapture?: (event: K) => void,
  onPointerDownCapture?: (event: P) => void,
) {
  const keyboardRef = React.useRef(false);
  return {
    keyboard: keyboardRef,
    handlers: {
      onKeyDownCapture: (event: K) => {
        keyboardRef.current = NAVIGATION_KEYS.has(event.key);
        onKeyDownCapture?.(event);
      },
      onPointerDownCapture: (event: P) => {
        keyboardRef.current = false;
        onPointerDownCapture?.(event);
      },
    },
  };
}

/** Elements this module already animated (fresh ones start hidden). */
const animated = new WeakSet<Element>();
/** Exit copies of content React already removed (React Aria). */
const ghosts = new WeakSet<Element>();

/** What scales: the indicator's element children, or the indicator itself. */
function contentOf(indicator: Element): Styled[] {
  const children = Array.from(indicator.children).filter(
    (child) => !ghosts.has(child),
  ) as Styled[];
  return children.length > 0 ? children : [indicator as Styled];
}

function setStyle(
  targets: Styled[],
  style: { opacity: number; transform: string },
) {
  for (const target of targets) {
    target.style.opacity = String(style.opacity);
    target.style.transform = style.transform;
  }
}

/**
 * Motion reads a transform-less element as `none`, which it can only
 * interpolate from `scale(0)`: content rendered at rest gets its resting
 * transform written out before it animates.
 */
function writeRest(targets: Styled[]) {
  for (const target of targets)
    if (!target.style.transform) target.style.transform = shown.transform;
}

/**
 * Shows the content. Fresh elements start hidden on this very frame (no flash
 * before the animation starts); the others retarget from where they are.
 */
function showContent(
  targets: Styled[],
  transition: Transition,
  reduce: boolean,
) {
  if (targets.length === 0) return;
  const fresh = targets.filter((target) => !animated.has(target));
  const known = targets.filter((target) => animated.has(target));
  targets.forEach((target) => animated.add(target));

  const from = hidden(reduce);
  if (fresh.length > 0) {
    setStyle(fresh, from);
    animate(
      fresh,
      {
        opacity: [from.opacity, shown.opacity],
        transform: [from.transform, shown.transform],
      },
      transition,
    );
  }
  if (known.length > 0) {
    writeRest(known);
    animate(known, shown, transition);
  }
}

function hideContent(
  targets: Styled[],
  transition: Transition,
  reduce: boolean,
): Promise<void> {
  if (targets.length === 0) return Promise.resolve();
  targets.forEach((target) => animated.add(target));
  writeRest(targets);
  return new Promise((resolve) => {
    animate(targets, hidden(reduce), transition).then(() => resolve());
  });
}

function hideContentNow(targets: Styled[], reduce: boolean) {
  targets.forEach((target) => animated.add(target));
  setStyle(targets, hidden(reduce));
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

/** Animation tokens of an indicator, with the part's overrides. */
function useIndicatorTransitions({
  transition,
  exitTransition,
}: IndicatorAnimationProps) {
  const tokens = useMotionTokens();
  const keyboard = React.use(KeyboardSelectionContext);
  const enter = transition ?? tokens.transition.change;
  const exit = exitTransition ?? tokens.transition.exit;
  // Read when animating (in effects), not while rendering.
  return {
    enter: () => (keyboard?.current ? tokens.transition.instant : enter),
    exit: () => (keyboard?.current ? tokens.transition.instant : exit),
  };
}

type IndicatorContentProps = React.ComponentPropsWithRef<'span'> &
  IndicatorAnimationProps & {
    /** The control is checked (or indeterminate). */
    checked: boolean;
  };

/**
 * The indicator element of Radix UI and Base UI controls, rendered inside
 * `AnimatePresence` by the part: shows its content when checked, and delays
 * its own unmount until the content has left. A force-mounted (kept-mounted)
 * indicator stays in the DOM with its content hidden.
 */
function IndicatorContent({
  checked,
  transition,
  exitTransition,
  ref,
  ...props
}: IndicatorContentProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  // Content already there on the first render (a checked box on page load)
  // doesn't animate: the part's AnimatePresence has `initial={false}`.
  const animateOnMount = React.use(PresenceContext)?.initial !== false;
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions({
    transition,
    exitTransition,
  });
  const visible = checked && isPresent;
  const lastRef = React.useRef<boolean | null>(null);
  const runRef = React.useRef(0);

  React.useLayoutEffect(() => {
    if (lastRef.current === visible) return;
    const first = lastRef.current === null;
    lastRef.current = visible;
    const id = ++runRef.current;
    const element = localRef.current;
    if (!element) {
      if (!isPresent) safeToRemove?.();
      return;
    }
    const targets = contentOf(element);

    if (first) {
      if (!visible) hideContentNow(targets, reduce);
      else if (animateOnMount) showContent(targets, enter(), reduce);
      else targets.forEach((target) => animated.add(target));
      return;
    }
    if (visible) {
      showContent(targets, enter(), reduce);
      return;
    }
    void hideContent(targets, exit(), reduce).then(() => {
      if (runRef.current === id && !isPresent) safeToRemove?.();
    });
  });

  const mergedRef = React.useMemo(() => mergeRefs(ref, localRef), [ref]);
  return <span {...props} ref={mergedRef} />;
}

type IndicatorPresenceProps = IndicatorContentProps & {
  /** Keep the indicator mounted while unchecked (`forceMount`, `keepMounted`). */
  keepMounted?: boolean;
};

/** Mounts the indicator while checked, and keeps it until its content left. */
function IndicatorPresence({ keepMounted, ...props }: IndicatorPresenceProps) {
  return (
    <AnimatePresence initial={false}>
      {(props.checked || keepMounted) && (
        <IndicatorContent key="indicator" {...props} />
      )}
    </AnimatePresence>
  );
}

/**
 * React Aria renders the indicator itself (shadcn/ui:
 * `<span data-slot="checkbox-indicator">{isSelected && <CheckIcon />}</span>`),
 * so the content mounts and unmounts with the state. Mounted content scales
 * in; removed content leaves through a copy put back for its exit, React's
 * tree is never touched.
 */
function useRenderedIndicator(
  rootRef: React.RefObject<Element | null>,
  selector: string,
  checked: boolean,
  animation: IndicatorAnimationProps,
) {
  const reduce = useShouldReduceMotion();
  const { enter, exit } = useIndicatorTransitions(animation);
  const lastRef = React.useRef<{ checked: boolean; content: Styled[] } | null>(
    null,
  );

  React.useLayoutEffect(() => {
    const indicator = rootRef.current?.querySelector(selector) ?? null;
    const content = indicator
      ? Array.from(indicator.children).filter((child) => !ghosts.has(child))
      : [];
    const previous = lastRef.current;
    lastRef.current = { checked, content: content as Styled[] };
    if (!previous) {
      content.forEach((child) => animated.add(child));
      return;
    }
    if (previous.checked === checked || !indicator) return;

    if (checked) {
      // Re-checked during an exit: the copies go at once.
      Array.from(indicator.children)
        .filter((child) => ghosts.has(child))
        .forEach((ghost) => ghost.remove());
      showContent(content as Styled[], enter(), reduce);
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
        setStyle([copy], shown);
        indicator.appendChild(copy);
        return copy;
      });
    const exiting = [...kept, ...copies];
    copies.forEach((copy) => animated.add(copy));
    void hideContent(exiting, exit(), reduce).then(() =>
      copies.forEach((copy) => copy.remove()),
    );
  });
}

export {
  KeyboardSelectionContext,
  useKeyboardSelection,
  IndicatorContent,
  IndicatorPresence,
  useRenderedIndicator,
  mergeRefs,
  type IndicatorAnimationProps,
  type IndicatorContentProps,
  type IndicatorPresenceProps,
};
