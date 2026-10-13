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

type IndicatorKind = 'check' | 'dot';

type IndicatorAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type CheckAnimationProps = {
  animation?: CheckAnimation;
};

const CHECK_TRANSITION: Transition = motionTokens.transition.check;
const CHECK_EXIT_TRANSITION: Transition = motionTokens.transition.uncheck;
const POP_TRANSITION: Transition = {
  ...motionTokens.spring.checkPop,
  delay: motionTokens.transition.check.delay,
};
const POP_EXIT_TRANSITION: Transition = motionTokens.transition.popOut;
const DOT_TRANSITION: Transition = motionTokens.spring.bounce;

const POP_FROM = motionTokens.scale.icon;
const POP_BLUR = 2;

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
  const exit = useTempoTransition(
    exitTransition ??
      (kind === 'dot' ? (transition ?? exitDefault) : exitDefault),
  );
  return { enter, exit };
}

const SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';

type Drawn = {
  mode: 'stroke' | 'fade' | 'pop';
  from: number;
  blur: number;
  progress: MotionValue<number>;
  opacity: number;
  inlineOpacity: string;
  inlineTransform: string;
  inlineFilter: string;
  dash: (string | null)[];
  reduce: boolean;
  controls: AnimationPlaybackControls | null;
  unsubscribe: () => void;
};

const drawn = new WeakMap<Element, Drawn>();
const ghosts = new WeakSet<Element>();

const DASH_ATTRIBUTES = ['pathLength', 'stroke-dasharray', 'stroke-dashoffset'];

type Styled = Element & ElementCSSInlineStyle;

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
    const plain = atRest || d.reduce || (p === 0 && d.blur > 0);
    el.style.transform = plain
      ? d.inlineTransform
      : `scale(${d.from + (1 - d.from) * p})`;
    if (d.blur)
      el.style.filter = plain
        ? d.inlineFilter
        : `blur(${d.blur * (1 - Math.min(1, Math.max(0, p)))}px)`;
  }
  el.style.opacity = atRest
    ? d.inlineOpacity
    : String(d.opacity * Math.min(1, Math.max(0, p)));
}

type Look = { kind: IndicatorKind; animation: CheckAnimation };

const pops = ({ kind, animation }: Look) =>
  kind === 'dot' || animation === 'pop';

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

const anyShown = (targets: Element[]) =>
  targets.some((el) => (drawn.get(el)?.progress.get() ?? 0) > 0);

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
    if (fresh && shown) d.progress.jump(0);
    const controls = animate(d.progress, shown ? 1 : 0, transition);
    d.controls = controls;
    return controls;
  });
  return Promise.all(runs).then(() => undefined);
}

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

type IndicatorHandle = {
  element: HTMLElement;
  toggle: (shown: boolean, animated: boolean) => void;
  isShown: () => boolean;
};

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

function contentOf(indicator: Element) {
  return Array.from(indicator.children).filter((child) => !ghosts.has(child));
}

type IndicatorContentProps = React.ComponentPropsWithRef<'span'> &
  IndicatorAnimationProps & {
    as?: 'span' | 'div';
    kind: IndicatorKind;
    animation?: CheckAnimation;
    checked: boolean;
    indeterminate?: boolean;
    coordinate?: Coordinate;
    animateOnMount?: boolean | (() => boolean);
  };

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
      forget([element, ...last.content]);
      setNow(targets, look, visible, reduce);
      return;
    }
    if (last.visible === visible) {
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
  keepMounted?: boolean;
};

function IndicatorPresence({ keepMounted, ...props }: IndicatorPresenceProps) {
  return (
    <AnimatePresence initial={false}>
      {(props.checked || keepMounted) && (
        <IndicatorContent key="indicator" {...props} />
      )}
    </AnimatePresence>
  );
}

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
      forget(previous.content);
      setNow(targetsOf(content, look), look, true, reduce);
      return;
    }
    if (previous.checked === checked) {
      const fresh = targetsOf(content, look).filter((el) => !drawn.has(el));
      if (checked && fresh.length > 0)
        void animateTo(fresh, look, true, enterTransition, reduce);
      return;
    }

    if (checked) {
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
