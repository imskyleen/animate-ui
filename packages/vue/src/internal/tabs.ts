import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type VNode,
} from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
  type CssTiming,
} from '../utils/motion';
import { curveFrom } from './momentum';
import {
  isRunning,
  onNextFrame,
  startNow,
  useSlidingIndicator,
  type SlidingIndicatorConfig,
  type SlidingIndicatorOptions,
  layoutSizeOf,
} from './sliding-indicator';

const TAB_ATTRIBUTE = 'data-animate-ui-tab';
const READY_ATTRIBUTE = 'data-animate-ui-indicator';
const SETTLING_ATTRIBUTE = 'data-animate-ui-indicator-settling';
const COLOR_DURATION_VAR = '--animate-ui-tab-color-duration';
const COLOR_EASING_VAR = '--animate-ui-tab-color-easing';

const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{background-color:transparent;background-image:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]::after{opacity:0}`,
  `[${READY_ATTRIBUTE}] [${TAB_ATTRIBUTE}]{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke;transition-duration:var(${COLOR_DURATION_VAR},.2s);transition-timing-function:var(${COLOR_EASING_VAR},ease)}`,
  `[${SETTLING_ATTRIBUTE}] [${TAB_ATTRIBUTE}][aria-selected="true"]{transition:none}`,
].join('');

function findActiveTab(list: HTMLElement) {
  for (const tab of list.querySelectorAll(`[${TAB_ATTRIBUTE}]`)) {
    if (
      tab.getAttribute('aria-selected') === 'true' &&
      tab.closest('[role="tablist"]') === list
    )
      return tab as HTMLElement;
  }
  return null;
}

const TABS_INDICATOR: SlidingIndicatorConfig = {
  findActive: findActiveTab,
  items: `[${TAB_ATTRIBUTE}]`,
  attributes: [
    'aria-selected',
    'class',
    'data-state',
    'data-active',
    'data-selected',
    'data-orientation',
    'data-disabled',
  ],
  style: { href: 'animate-ui-tabs-indicator', css: SURFACE_CSS },
  slot: 'tabs-indicator',
};

type TabsIndicatorOptions = SlidingIndicatorOptions;

/** The tabs' indicator: a copy of the active tab's look, sliding to the next one. */
function useTabsIndicator(
  list: Ref<HTMLElement | null>,
  options: () => TabsIndicatorOptions = () => ({}),
): {
  render: () => VNode | null;
  listProps: ComputedRef<Record<string, string | undefined>>;
} {
  const { render, ready, settling } = useSlidingIndicator(
    list,
    TABS_INDICATOR,
    options,
  );
  const color = useTempoTransition(() => motionTokens.transition.color);
  watch(
    () =>
      [
        list.value,
        options().enabled ?? true,
        !options().surface,
        color.value,
      ] as const,
    ([el, on, copy, transition]) => {
      if (!el || !on || !copy) return;
      const timing = toCssTiming(transition);
      el.style.setProperty(COLOR_DURATION_VAR, `${timing.duration}ms`);
      el.style.setProperty(COLOR_EASING_VAR, timing.easing);
    },
    { immediate: true, flush: 'post' },
  );
  return {
    render,
    listProps: computed(() => ({
      [READY_ATTRIBUTE]: ready.value ? '' : undefined,
      [SETTLING_ATTRIBUTE]: settling.value ? '' : undefined,
    })),
  };
}

const HOLD_PROPERTY = '--animate-ui-tab-leaving';

type PanelStage = {
  current: object | null;
  shown: boolean;
  height: Extent | undefined;
  frame: { look: string; extent: Extent } | null;
  last: HTMLElement | null;
  panels: Map<object, { element: HTMLElement; selected: boolean }>;
  waiting: Set<() => void>;
  painted: boolean;
};

const stages = new WeakMap<Element, PanelStage>();

function stageOf(holder: Element) {
  let stage = stages.get(holder);
  if (!stage) {
    const created: PanelStage = {
      current: null,
      shown: false,
      height: undefined,
      frame: null,
      last: null,
      panels: new Map(),
      waiting: new Set(),
      painted: false,
    };
    onNextFrame(() => (created.painted = true));
    stages.set(holder, created);
    stage = created;
  }
  return stage;
}

function release(stage: PanelStage, token: object) {
  if (stage.current !== token) return;
  stage.current = null;
  for (const go of [...stage.waiting]) go();
}

const TRANSPARENT = /^transparent$|[,/]\s*0(?:\.0*)?\s*\)$/;
const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;

function paintsBox(style: CSSStyleDeclaration) {
  return (
    SIDES.some(
      (side) =>
        parseFloat(style[`border${side}Width`]) > 0 &&
        style[`border${side}Style`] !== 'none' &&
        !TRANSPARENT.test(style[`border${side}Color`]),
    ) ||
    !TRANSPARENT.test(style.backgroundColor) ||
    style.backgroundImage !== 'none' ||
    style.boxShadow !== 'none'
  );
}

const hasText = (element: Element) =>
  Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );

function frameOf(panel: HTMLElement): HTMLElement | null {
  let element: Element = panel;
  for (;;) {
    if (!(element instanceof HTMLElement)) return null;
    if (paintsBox(getComputedStyle(element)))
      return hasText(element) ? null : element;
    const [child] = element.children;
    if (element.children.length !== 1 || !child || hasText(element))
      return null;
    element = child;
  }
}

const LOOK = [
  ...SIDES.flatMap((side) => [
    `border-${side.toLowerCase()}-width`,
    `border-${side.toLowerCase()}-style`,
    `border-${side.toLowerCase()}-color`,
  ]),
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background-color',
  'background-image',
  'box-shadow',
];

function lookOf(frame: HTMLElement) {
  const style = getComputedStyle(frame);
  return LOOK.map((property) => style.getPropertyValue(property)).join('|');
}

type PanelAnimations = {
  fades: Map<Element, Animation>;
  targets: Element[];
  frame: HTMLElement | null;
  leaving: boolean;
  hold?: Animation;
  height?: Animation;
  follow?: { disconnect(): void };
};

const panelAnimations = new WeakMap<Element, PanelAnimations>();

function animationsOf(panel: Element) {
  let animations = panelAnimations.get(panel);
  if (!animations) {
    animations = { fades: new Map(), targets: [], frame: null, leaving: false };
    panelAnimations.set(panel, animations);
  }
  return animations;
}

function cancelAll(panel: Element) {
  const animations = panelAnimations.get(panel);
  if (!animations) return;
  for (const fade of animations.fades.values()) fade.cancel();
  animations.hold?.cancel();
  animations.height?.cancel();
  animations.follow?.disconnect();
  panelAnimations.delete(panel);
}

type Way = [number, number];

function wayOf(holder: Element, from: Element | null, to: Element | null) {
  if (!from?.isConnected || !to?.isConnected || from === to) return null;
  const later =
    from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING
      ? 1
      : -1;
  let list: Element | null = null;
  for (let around: Element | null = holder; around && !list;)
    [list, around] = [
      around.querySelector('[role="tablist"]'),
      around.parentElement,
    ];
  const vertical =
    list?.getAttribute('aria-orientation') === 'vertical' ||
    list?.getAttribute('data-orientation') === 'vertical';
  if (vertical) return [0, later] as Way;
  const rtl = getComputedStyle(list ?? holder).direction === 'rtl';
  return [rtl ? -later : later, 0] as Way;
}

function shownNow(element: Element, blur: boolean, move: boolean): Keyframe {
  const style = getComputedStyle(element);
  const shown: Keyframe = { opacity: style.opacity };
  if (blur) shown.filter = style.filter === 'none' ? 'blur(0px)' : style.filter;
  if (move)
    shown.translate = style.translate === 'none' ? '0px 0px' : style.translate;
  return shown;
}

function gone(blur: boolean, way: Way | null): Keyframe {
  const hidden: Keyframe = { opacity: 0 };
  if (blur) hidden.filter = motionTokens.blur.panel;
  if (way) {
    const [x, y] = way.map((side) => side * motionTokens.shift.tabs);
    hidden.translate = `${x}px ${y}px`;
  }
  return hidden;
}

const POSITIONED = ['absolute', 'fixed'];

function anchorsOutside(target: Element) {
  if (getComputedStyle(target).position !== 'static') return false;
  const stack = [target];
  while (stack.length) {
    const element = stack.pop()!;
    for (const pseudo of ['::before', '::after'])
      if (POSITIONED.includes(getComputedStyle(element, pseudo).position))
        return true;
    for (const child of element.children) {
      const position = getComputedStyle(child).position;
      if (POSITIONED.includes(position)) return true;
      if (position === 'static') stack.push(child);
    }
  }
  return false;
}

function effectsOf(target: Element, timings: PanelTimings) {
  const plain = anchorsOutside(target);
  return { blur: timings.blur && !plain, move: timings.shift && !plain };
}

type PanelTimings = {
  in: CssTiming;
  out: CssTiming;
  height: CssTiming;
  follow: Transition;
  blur: boolean;
  glide: boolean;
  shift: boolean;
};

const targetsOf = (panel: HTMLElement, frame: HTMLElement | null) =>
  frame ? Array.from(frame.children) : [panel];

function fade(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  keyframes: (target: Element) => Keyframe[],
  options: KeyframeAnimationOptions,
  leaving: boolean,
) {
  const animations = animationsOf(panel);
  const frames = targets.map(keyframes);
  targets.forEach((target, i) => {
    animations.fades.get(target)?.cancel();
    animations.fades.set(target, startNow(target.animate(frames[i]!, options)));
  });
  animations.targets = targets;
  animations.frame = frame;
  animations.leaving = leaving;
}

function fadeIn(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  timings: PanelTimings,
  from: { way: Way | null } | null,
) {
  const animations = animationsOf(panel);
  animations.hold?.cancel();
  animations.hold = undefined;
  fade(
    panel,
    targets,
    frame,
    (target) => {
      const { blur, move } = effectsOf(target, timings);
      const start = from
        ? gone(blur, move ? from.way : null)
        : shownNow(target, blur, move);
      return [{ ...start, offset: 0 }];
    },
    {
      duration: timings.in.duration,
      easing: timings.in.easing,
      fill: 'backwards',
    },
    false,
  );
}

function fadeOut(
  panel: HTMLElement,
  targets: Element[],
  frame: HTMLElement | null,
  timings: PanelTimings,
  way: Way | null,
) {
  fade(
    panel,
    targets,
    frame,
    (target) => {
      const { blur, move } = effectsOf(target, timings);
      const away = move && way ? ([-way[0], -way[1]] as Way) : null;
      return [shownNow(target, blur, move), gone(blur, away)];
    },
    {
      duration: timings.out.duration,
      easing: timings.out.easing,
      fill: 'both',
    },
    true,
  );
}

const collapse = (a: number, b: number) =>
  Math.max(a, b, 0) + Math.min(a, b, 0);

function marginBelow(element: HTMLElement) {
  const style = getComputedStyle(element);
  const own = parseFloat(style.marginBottom) || 0;
  if (
    parseFloat(style.paddingBottom) > 0 ||
    parseFloat(style.borderBottomWidth) > 0
  )
    return own;
  const inline = element.getAttribute('style');
  const height = element.getBoundingClientRect().height;
  element.style.setProperty('transition', 'none', 'important');
  element.style.setProperty('padding-bottom', '1px', 'important');
  const one = element.getBoundingClientRect().height;
  element.style.setProperty('padding-bottom', '2px', 'important');
  const two = element.getBoundingClientRect().height;
  element.style.removeProperty('padding-bottom');
  void getComputedStyle(element).paddingBottom;
  if (inline === null) element.removeAttribute('style');
  else element.setAttribute('style', inline);
  if (Math.abs(two - one - 1) > 0.25) return own;
  return collapse(own, one - 1 - height);
}

type Extent = { height: number; margin: number };

function heightOf(element: HTMLElement) {
  const drawn = element.getBoundingClientRect().height;
  const layout = layoutSizeOf(element).height;
  return Math.abs(drawn - layout) < 0.01 ? drawn : layout;
}

const extentOf = (element: HTMLElement): Extent => ({
  height: heightOf(element),
  margin: marginBelow(element),
});

function glideHeight(
  panel: HTMLElement,
  target: HTMLElement,
  from: Extent,
  timing: CssTiming,
  follow: Transition,
) {
  const animations = animationsOf(panel);
  animations.height?.cancel();
  animations.height = undefined;
  animations.follow?.disconnect();
  animations.follow = undefined;
  const to = extentOf(target);
  if (!(to.height > 0)) return;
  const delay = (timing as CssTiming & { delay?: number }).delay ?? 0;
  const style = getComputedStyle(target);
  const own = parseFloat(style.marginBottom) || 0;
  const inset =
    style.boxSizing === 'border-box'
      ? 0
      : parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);
  const clip =
    style.overflowY === 'visible' ? { overflowY: ['clip', 'clip'] } : {};
  const run = (start: Extent, end: Extent, options: CssTiming) => {
    const sizes = [`${start.height - inset}px`, `${end.height - inset}px`];
    const margin =
      Math.abs(start.margin - own) > 0.5 || Math.abs(end.margin - own) > 0.5
        ? { marginBottom: [`${start.margin}px`, `${end.margin}px`] }
        : {};
    const animation = startNow(
      target.animate(
        { minHeight: sizes, maxHeight: sizes, ...margin, ...clip },
        { ...options, fill: 'backwards' },
      ),
    );
    animations.height = animation;
    return animation;
  };
  const same = (a: Extent, b: Extent) =>
    Math.abs(a.height - b.height) <= 0.5 &&
    Math.abs(a.margin - b.margin) <= 0.5;
  let end = to;
  let glide: Animation | null = same(from, to) ? null : run(from, to, timing);
  let waiting = delay > 0 ? glide : null;
  let rested = -Infinity;

  const check = () => {
    if (animations.height !== (glide ?? undefined)) return watch.disconnect();
    if (glide && glide === waiting && Number(glide.currentTime ?? 0) < 0) {
      const started = glide.startTime;
      glide.cancel();
      const natural = extentOf(target);
      if (!same(natural, end)) end = natural;
      glide = run(from, end, timing);
      glide.startTime = started;
      waiting = glide;
      return;
    }
    let now = end;
    let velocity = 0;
    let elapsed = 0;
    const running = !!glide && glide.playState !== 'finished';
    if (glide && running) {
      elapsed = Number(glide.currentTime ?? 0);
      now = {
        height: heightOf(target),
        margin: parseFloat(getComputedStyle(target).marginBottom) || 0,
      };
      const step = Math.min(elapsed, 8);
      glide.currentTime = elapsed - step;
      velocity = step > 0 ? (now.height - heightOf(target)) / step : 0;
      glide.cancel();
    }
    const natural = extentOf(target);
    if (same(natural, end)) {
      if (glide && running) {
        glide.play();
        glide.currentTime = elapsed;
      }
      return;
    }
    const time = performance.now();
    if (time - rested < 50) {
      animations.height = undefined;
      return watch.disconnect();
    }
    if (!running) rested = time;
    end = natural;
    const curve = curveFrom(follow, [now.height - natural.height], [velocity]);
    glide = run(now, natural, {
      duration: curve.duration,
      easing: curve.easing,
    });
  };
  const resize = new ResizeObserver(check);
  const mutation = new MutationObserver((records) => {
    for (const record of records)
      if (record.target === target)
        for (const node of record.addedNodes)
          if (node instanceof Element) resize.observe(node);
    check();
  });
  for (const child of target.children) resize.observe(child);
  mutation.observe(target, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  const timer = setTimeout(
    () => watch.disconnect(),
    delay + timing.duration + toCssTiming(follow).duration,
  );
  const watch = {
    disconnect() {
      clearTimeout(timer);
      resize.disconnect();
      mutation.disconnect();
    },
  };
  animations.follow = watch;
}

function isGliding(panel: HTMLElement) {
  const height = panelAnimations.get(panel)?.height;
  return height !== undefined && isRunning(height);
}

function stopGlide(panel: HTMLElement) {
  const animations = panelAnimations.get(panel);
  if (!animations) return;
  animations.height?.cancel();
  animations.height = undefined;
  animations.follow?.disconnect();
  animations.follow = undefined;
}

const nextOf = (stage: PanelStage, token: object) =>
  [...stage.panels].find(
    ([other, entry]) => other !== token && entry.selected,
  )?.[1].element ?? null;

function leavingFrame(panel: HTMLElement, next: HTMLElement | null) {
  const animations = panelAnimations.get(panel);
  if (
    animations &&
    !animations.frame &&
    [...animations.fades.values()].some(isRunning)
  )
    return null;
  const frame = frameOf(panel);
  if (!frame) return null;
  const nextFrame = next ? frameOf(next) : null;
  return nextFrame && lookOf(nextFrame) === lookOf(frame) ? frame : null;
}

const isDisplayed = (element: HTMLElement) =>
  element.getClientRects().length > 0;

type PanelMotionOptions = {
  transition?: Transition;
  exitTransition?: Transition;
  heightTransition?: Transition;
};

/**
 * A tab panel's own motion: the panel left fades out (and slides away), the
 * next one waits for it, then fades in while the holder's height glides.
 */
function usePanelMotion(
  selected: () => boolean,
  options: () => PanelMotionOptions = () => ({}),
): {
  element: Ref<HTMLElement | null>;
  waiting: ComputedRef<boolean>;
  leaving: ComputedRef<boolean>;
} {
  const element = shallowRef<HTMLElement | null>(null);
  const token = {};
  const exit = ref<'open' | 'leaving' | 'closed'>(
    selected() ? 'open' : 'closed',
  );
  const waiting = ref(false);
  watch(
    selected,
    (now) => {
      if (now) exit.value = 'open';
      else {
        if (exit.value === 'open')
          exit.value = waiting.value ? 'closed' : 'leaving';
        waiting.value = false;
      }
    },
    { flush: 'sync' },
  );

  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(
    () => options().transition ?? motionTokens.transition.panelIn,
  );
  const leave = useTempoTransition(
    () => options().exitTransition ?? motionTokens.transition.panelOut,
  );
  const height = useTempoTransition(
    () =>
      (options().transition as { height?: Transition } | undefined)?.height ??
      options().heightTransition ??
      options().transition ??
      motionTokens.transition.panelHeight,
  );
  const quickFade = useTempoTransition(() => motionTokens.transition.fade);
  const follow = useTempoTransition(() => motionTokens.spring.morph);
  const timings = (): PanelTimings => ({
    in: toCssTiming(reduce.value ? quickFade.value : enter.value),
    out: toCssTiming(leave.value),
    height: toCssTiming(height.value),
    follow: follow.value,
    blur: true,
    glide: !reduce.value,
    shift: !reduce.value,
  });
  let stage: PanelStage | null = null;

  watch(
    () => [element.value, selected()] as const,
    ([el, isSelected], _, onCleanup) => {
      const holder = el?.parentElement;
      if (!el || !holder) return;
      const own = stageOf(holder);
      own.panels.set(token, { element: el, selected: isSelected });
      onCleanup(() => own.panels.delete(token));
    },
    { immediate: true, flush: 'post' },
  );

  watch(
    () => [selected(), waiting.value, element.value] as const,
    ([isSelected, isWaiting, el], _, onCleanup) => {
      const holder = el?.parentElement;
      if (!isSelected || !el || !holder) return;
      const own = stageOf(holder);
      stage = own;
      if (isWaiting) {
        const go = () => (waiting.value = false);
        if (!own.current) go();
        else {
          own.waiting.add(go);
          onCleanup(() => own.waiting.delete(go));
        }
        return;
      }
      if (own.current && own.current !== token) {
        waiting.value = true;
        return;
      }
      const current = timings();
      if (own.current === token) {
        const running = panelAnimations.get(el);
        if (running?.leaving)
          fadeIn(el, running.targets, running.frame, current, null);
        return;
      }
      own.current = token;
      const way = wayOf(holder, own.last, el);
      own.last = el;
      const comesIn = own.shown && own.painted;
      own.shown = true;
      const left = own.frame;
      own.frame = null;
      if (!comesIn || typeof el.animate !== 'function') return;
      const candidate = left ? frameOf(el) : null;
      const frame =
        left && candidate && lookOf(candidate) === left.look ? candidate : null;
      fadeIn(el, targetsOf(el, frame), frame, current, { way });
      if (!current.glide) return;
      if (frame && left)
        glideHeight(el, frame, left.extent, current.height, current.follow);
      else if (own.height !== undefined)
        glideHeight(el, el, own.height, current.height, current.follow);
    },
    { immediate: true, flush: 'post' },
  );

  watch(
    exit,
    (state, _, onCleanup) => {
      const el = element.value;
      if (state !== 'leaving') return;
      const own = stage;
      let cancelled = false;
      const goes = () => {
        exit.value = 'closed';
        if (own) release(own, token);
      };
      if (
        !el ||
        !own ||
        own.current !== token ||
        !own.painted ||
        !isDisplayed(el) ||
        typeof el.animate !== 'function'
      ) {
        if (el) cancelAll(el);
        if (own?.current === token) {
          own.height = undefined;
          own.frame = null;
        }
        goes();
        return;
      }
      const current = timings();
      const animations = animationsOf(el);
      animations.hold?.cancel();
      const hold = startNow(
        el.animate(
          { [HOLD_PROPERTY]: ['1', '1'] },
          { duration: current.out.duration },
        ),
      );
      animations.hold = hold;
      // reka-ui renders the next panel's content a couple of ticks after selecting it.
      void (async () => {
        for (let tick = 0; tick < 4; tick++) {
          const waited = nextOf(own, token);
          if (waited && waited.children.length > 0) break;
          await nextTick();
        }
        if (cancelled) return;
        const next = nextOf(own, token);
        const frame = leavingFrame(el, next);
        const way = el.parentElement ? wayOf(el.parentElement, el, next) : null;
        fadeOut(el, targetsOf(el, frame), frame, current, way);
      })();
      hold.finished.then(
        async () => {
          if (cancelled) return;
          const frame = panelAnimations.get(el)?.frame ?? null;
          own.height = extentOf(el);
          own.frame = frame
            ? { look: lookOf(frame), extent: extentOf(frame) }
            : null;
          goes();
          await nextTick();
          cancelAll(el);
        },
        () => {},
      );
      onCleanup(() => {
        cancelled = true;
      });
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    if (stage) release(stage, token);
    if (element.value) cancelAll(element.value);
  });

  return {
    element,
    waiting: computed(() => selected() && waiting.value),
    leaving: computed(() => exit.value === 'leaving'),
  };
}

export {
  TAB_ATTRIBUTE,
  useTabsIndicator,
  usePanelMotion,
  glideHeight,
  stopGlide,
  isGliding,
  extentOf,
  heightOf,
  type TabsIndicatorOptions,
  type PanelMotionOptions,
  type Extent,
};
