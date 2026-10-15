'use client';

import * as React from 'react';
import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';
import { motion, type Transition } from 'motion/react';

import { mergeRefs } from '../../internal/anchored';
import { usePressMotion } from '../../internal/controls/press';
import {
  CHECK_EXIT_TRANSITION,
  CHECK_TRANSITION,
  DOT_TRANSITION,
  POP_EXIT_TRANSITION,
  POP_TRANSITION,
  animateTo,
  targetsOf,
  type Look,
} from '../../internal/controls/indicator';
import {
  layoutSizeOf,
  onNextFrame,
  startNow,
} from '../../internal/sliding-indicator';
import {
  glideHeight,
  heightOf,
  isGliding,
  stopGlide,
} from '../../internal/tabs';
import {
  motionTokens,
  toCssTiming,
  useCheckAnimation,
  useShouldReduceMotion,
  useTempoTransition,
  type CssTiming,
} from '../../utils/motion';

const ROOT_ATTRIBUTE = 'data-animate-ui-questionnaire';
const READY_ATTRIBUTE = 'data-animate-ui-questionnaire-ready';
const STATE_ATTRIBUTES = ['disabled', 'data-disabled', 'data-status', 'class'];
const PART_ATTRIBUTE = 'data-animate-ui-questionnaire-part';
const INDICATOR = '[data-slot="questionnaire-choice-indicator"]';
const DOT = '[data-slot="questionnaire-choice-indicator-dot"]';
const CHECK = '[data-slot="questionnaire-choice-indicator-check"]';
const COUNT_ATTRIBUTE = 'data-animate-ui-questionnaire-count';
const FROM_ATTRIBUTE = 'data-animate-ui-from';
const TO_ATTRIBUTE = 'data-animate-ui-to';
const HOLD_ATTRIBUTE = 'data-animate-ui-hold';
const COUNT_SHIFT = 0.6;
const COLOR_DURATION_VAR = '--animate-ui-questionnaire-color-duration';
const COLOR_EASING_VAR = '--animate-ui-questionnaire-color-easing';

const QUESTIONNAIRE_CSS = [
  `[${READY_ATTRIBUTE}] [${PART_ATTRIBUTE}="choice"] ${INDICATOR}{transition-property:background-color,border-color,color;transition-duration:var(${COLOR_DURATION_VAR},.2s);transition-timing-function:var(${COLOR_EASING_VAR},ease)}`,
  `[${COUNT_ATTRIBUTE}]{position:relative;display:inline-block}`,
  `[${COUNT_ATTRIBUTE}]:is([${FROM_ATTRIBUTE}],[${HOLD_ATTRIBUTE}]){-webkit-text-fill-color:transparent}`,
  `[${COUNT_ATTRIBUTE}][${FROM_ATTRIBUTE}]::before{content:attr(${FROM_ATTRIBUTE});content:attr(${FROM_ATTRIBUTE}) / ""}`,
  `[${COUNT_ATTRIBUTE}][${FROM_ATTRIBUTE}]::after{content:attr(${TO_ATTRIBUTE});content:attr(${TO_ATTRIBUTE}) / ""}`,
  `[${COUNT_ATTRIBUTE}][${HOLD_ATTRIBUTE}]::before{content:attr(${HOLD_ATTRIBUTE});content:attr(${HOLD_ATTRIBUTE}) / ""}`,
  `[${COUNT_ATTRIBUTE}]:is([${FROM_ATTRIBUTE}],[${HOLD_ATTRIBUTE}])::before,[${COUNT_ATTRIBUTE}][${FROM_ATTRIBUTE}]::after{position:absolute;inset:0;-webkit-text-fill-color:currentcolor;pointer-events:none}`,
].join('');

type Timings = {
  out: CssTiming;
  in: CssTiming;
  fade: CssTiming;
  height: CssTiming;
  follow: Transition;
  disclosure: CssTiming;
  swap: CssTiming;
  check: { enter: unknown; exit: unknown; animation: Look['animation'] };
  dot: unknown;
  reduce: boolean;
};

const running = new WeakMap<Element, Animation[]>();
const itemGlides = new WeakMap<HTMLElement, Animation>();
const arriving = new WeakMap<HTMLElement, number>();

function stop(element: Element) {
  running.get(element)?.forEach((animation) => animation.cancel());
  running.delete(element);
}

function track(element: Element, animation: Animation) {
  running.set(element, [...(running.get(element) ?? []), animation]);
  return animation;
}

const isCurrent = (element: Element, animation: Animation) =>
  running.get(element)?.includes(animation) ?? false;

const isRunning = (animation: Animation | undefined) =>
  animation !== undefined &&
  animation.playState !== 'finished' &&
  animation.playState !== 'idle';

function lookOf(element: Element, pseudoElement?: string) {
  const style = getComputedStyle(element, pseudoElement);
  return {
    opacity: style.opacity,
    translate: style.translate === 'none' ? '0px 0px' : style.translate,
    filter: style.filter === 'none' ? 'blur(0px)' : style.filter,
    scale: style.scale === 'none' ? '1' : style.scale,
  };
}

function stopItemGlide(item: HTMLElement) {
  stopGlide(item);
  itemGlides.get(item)?.cancel();
  itemGlides.delete(item);
}

const PIN_STYLES = [
  'position',
  'top',
  'left',
  'width',
  'height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'grid-row-start',
  'grid-row-end',
  'grid-column-start',
  'grid-column-end',
  'box-sizing',
] as const;

type Saved = Map<string, [value: string, priority: string]>;

const pinned = new WeakMap<HTMLElement, Saved>();
const positioned = new WeakMap<
  HTMLElement,
  { count: number; saved: [string, string] | null }
>();

const save = (element: HTMLElement, names: readonly string[]): Saved =>
  new Map(
    names.map((name) => [
      name,
      [
        element.style.getPropertyValue(name),
        element.style.getPropertyPriority(name),
      ],
    ]),
  );

function restore(element: HTMLElement, saved: Saved) {
  for (const [name, [value, priority]] of saved) {
    if (value) element.style.setProperty(name, value, priority);
    else element.style.removeProperty(name);
  }
}

function holdParent(parent: HTMLElement) {
  const entry = positioned.get(parent);
  if (entry) {
    entry.count++;
    return;
  }
  const isStatic = getComputedStyle(parent).position === 'static';
  positioned.set(parent, {
    count: 1,
    saved: isStatic
      ? [
          parent.style.getPropertyValue('position'),
          parent.style.getPropertyPriority('position'),
        ]
      : null,
  });
  if (isStatic) parent.style.position = 'relative';
}

function releaseParent(parent: HTMLElement) {
  const entry = positioned.get(parent);
  if (!entry || --entry.count > 0) return;
  positioned.delete(parent);
  if (entry.saved) restore(parent, new Map([['position', entry.saved]]));
}

type Box = { left: number; top: number; width: number; height: number };

function boxIn(parent: HTMLElement, element: Element): Box {
  const outer = parent.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const layout = layoutSizeOf(parent);
  const sx =
    layout.width && Math.abs(outer.width - layout.width) > 0.01
      ? outer.width / layout.width
      : 1;
  const sy =
    layout.height && Math.abs(outer.height - layout.height) > 0.01
      ? outer.height / layout.height
      : 1;
  return {
    left: (rect.left - outer.left) / sx - parent.clientLeft,
    top: (rect.top - outer.top) / sy - parent.clientTop,
    width: rect.width / sx,
    height: rect.height / sy,
  };
}

function pin(
  element: HTMLElement,
  measure: (parent: HTMLElement) => Partial<Box> & {
    left: number;
    top: number;
    width: number;
  },
) {
  const parent = element.parentElement;
  if (!parent) return;
  if (!pinned.has(element)) {
    pinned.set(element, save(element, PIN_STYLES));
    holdParent(parent);
  }
  element.style.position = 'absolute';
  element.style.margin = '0px';
  element.style.gridArea = 'auto';
  element.style.boxSizing = 'border-box';
  const box = measure(parent);
  element.style.left = `${box.left}px`;
  element.style.top = `${box.top}px`;
  element.style.width = `${box.width}px`;
  if (box.height !== undefined) element.style.height = `${box.height}px`;
}

function unpin(element: HTMLElement) {
  const saved = pinned.get(element);
  if (!saved) return;
  pinned.delete(element);
  restore(element, saved);
  if (element.parentElement) releaseParent(element.parentElement);
}

function exitLeft(element: Element) {
  let left = 0;
  for (const animation of running.get(element) ?? []) {
    const timing = animation.effect?.getComputedTiming();
    if (!timing || !isRunning(animation)) continue;
    left = Math.max(
      left,
      Number(timing.endTime ?? 0) - Number(timing.localTime ?? 0),
    );
  }
  return left;
}

function changeStep(from: HTMLElement, to: HTMLElement, t: Timings) {
  const parent = to.parentElement;
  if (!parent || from.parentElement !== parent) return;
  const later = Boolean(
    from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const rtl = getComputedStyle(to).direction === 'rtl';
  const way = (later ? 1 : -1) * (rtl ? -1 : 1);
  const { reduce } = t;
  const shift = motionTokens.shift.step;

  from.hidden = false;
  const height = heightOf(from);
  const leaving = lookOf(from);
  stop(from);
  stopItemGlide(from);

  const back = pinned.has(to) ? lookOf(to) : null;
  for (const count of to.querySelectorAll(`[${HOLD_ATTRIBUTE}]`))
    count.removeAttribute(HOLD_ATTRIBUTE);
  stop(to);
  stopItemGlide(to);
  unpin(to);

  pin(from, (holder) => {
    const { left, top, width } = boxIn(holder, to);
    return { left, top, width };
  });

  const hiddenOut = reduce
    ? { opacity: '0' }
    : {
        opacity: '0',
        translate: `${-way * shift}px 0px`,
        filter: motionTokens.blur.panel,
      };
  const exitTiming = reduce ? t.fade : t.out;
  const exitDuration = exitTiming.duration * Number(leaving.opacity);
  const exit = track(
    from,
    startNow(
      from.animate(
        [
          reduce
            ? { opacity: leaving.opacity }
            : {
                opacity: leaving.opacity,
                translate: leaving.translate,
                filter: leaving.filter,
              },
          hiddenOut,
        ],
        {
          duration: exitDuration,
          easing: exitTiming.easing,
          fill: 'both',
        },
      ),
    ),
  );
  void exit.finished.then(
    () => {
      if (!isCurrent(from, exit)) return;
      if (!from.hasAttribute('data-active')) from.hidden = true;
      unpin(from);
      stop(from);
      for (const count of from.querySelectorAll(`[${HOLD_ATTRIBUTE}]`))
        count.removeAttribute(HOLD_ATTRIBUTE);
    },
    () => {},
  );

  let wait = exitDuration;
  for (const sibling of parent.children)
    if (sibling !== from && pinned.has(sibling as HTMLElement))
      wait = Math.max(wait, exitLeft(sibling));
  const delay = back ? 0 : wait;
  arriving.set(to, performance.now() + delay);

  const shown = reduce
    ? { opacity: '1' }
    : { opacity: '1', translate: '0px 0px', filter: 'blur(0px)' };
  const hiddenIn = reduce
    ? { opacity: '0' }
    : {
        opacity: '0',
        translate: `${way * shift}px 0px`,
        filter: motionTokens.blur.panel,
      };
  const enterTiming = reduce ? t.fade : t.in;
  const start = back
    ? reduce
      ? { opacity: back.opacity }
      : {
          opacity: back.opacity,
          translate: back.translate,
          filter: back.filter,
        }
    : hiddenIn;
  track(
    to,
    startNow(
      to.animate([start, shown], {
        duration: enterTiming.duration,
        easing: enterTiming.easing,
        delay,
        fill: 'backwards',
      }),
    ),
  );
  glideHeight(
    to,
    to,
    { height, margin: 0 },
    {
      ...(reduce ? { duration: 1, easing: 'linear' } : t.height),
      delay,
    } as CssTiming,
    reduce ? { duration: 0 } : t.follow,
  );
}

function toggleChoice(label: HTMLElement, checked: boolean, t: Timings) {
  const checkbox = label.getAttribute('data-type') === 'checkbox';
  const content = label.querySelector<HTMLElement | SVGElement>(
    checkbox ? CHECK : DOT,
  );
  if (!content) return;
  const look: Look = {
    kind: checkbox ? 'check' : 'dot',
    animation: t.check.animation,
  };
  const targets = targetsOf([content], look);
  const transition = (
    checkbox ? (checked ? t.check.enter : t.check.exit) : t.dot
  ) as Parameters<typeof animateTo>[3];
  if (checked) {
    content.style.removeProperty('display');
    void animateTo(targets, look, true, transition, t.reduce);
    return;
  }
  content.style.display = 'block';
  void animateTo(targets, look, false, transition, t.reduce).then(() => {
    if (!label.hasAttribute('data-checked'))
      content.style.removeProperty('display');
  });
}

function toggleError(element: HTMLElement, shown: boolean, t: Timings) {
  element.hidden = false;
  const moving = running.has(element);
  const now = moving
    ? {
        ...lookOf(element),
        height: heightOf(element),
        margin: parseFloat(getComputedStyle(element).marginTop) || 0,
      }
    : null;
  stop(element);
  const item = element.closest<HTMLElement>(`[${PART_ATTRIBUTE}="item"]`);
  const gliding =
    item !== null && (isGliding(item) || isRunning(itemGlides.get(item)));
  const itemFrom = gliding ? heightOf(item) : 0;
  if (item) stopItemGlide(item);

  element.hidden = false;
  const parent = element.parentElement;
  const parentStyle = parent ? getComputedStyle(parent) : null;
  const gap =
    parentStyle && /flex|grid/.test(parentStyle.display)
      ? parseFloat(parentStyle.rowGap) || 0
      : 0;
  const style = getComputedStyle(element);
  const height = heightOf(element);
  const margin = parseFloat(style.marginTop) || 0;
  const open = {
    height: `${height}px`,
    marginTop: `${margin}px`,
    opacity: '1',
    filter: 'blur(0px)',
  };
  const folded = {
    height: '0px',
    marginTop: `${-gap}px`,
    opacity: '0',
    filter: motionTokens.blur.disclosure,
  };
  const timing = t.reduce ? t.fade : t.disclosure;
  const [from, to] = t.reduce
    ? [
        { opacity: now?.opacity ?? (shown ? '0' : '1') },
        { opacity: shown ? '1' : '0' },
      ]
    : [
        now
          ? {
              height: `${now.height}px`,
              marginTop: `${now.margin}px`,
              opacity: now.opacity,
              filter: now.filter,
            }
          : shown
            ? folded
            : open,
        shown ? open : folded,
      ];
  const animation = track(
    element,
    startNow(
      element.animate(
        [
          { ...from, overflow: 'clip' },
          { ...to, overflow: 'clip' },
        ],
        { duration: timing.duration, easing: timing.easing, fill: 'both' },
      ),
    ),
  );
  void animation.finished.then(
    () => {
      if (!isCurrent(element, animation)) return;
      if (!element.hasAttribute('data-invalid')) element.hidden = true;
      stop(element);
    },
    () => {},
  );

  if (gliding && item && !t.reduce) {
    const natural = heightOf(item);
    const first = now
      ? gap + now.margin + now.height
      : shown
        ? 0
        : gap + margin + height;
    const last = shown ? gap + margin + height : 0;
    const end = natural - first + last;
    const sizes = [`${itemFrom}px`, `${end}px`];
    itemGlides.set(
      item,
      startNow(
        item.animate(
          { minHeight: sizes, maxHeight: sizes, overflowY: ['clip', 'clip'] },
          {
            duration: timing.duration,
            easing: timing.easing,
            delay: Math.max(0, (arriving.get(item) ?? 0) - performance.now()),
            fill: 'backwards',
          },
        ),
      ),
    );
  }
}

type ElementLook = ReturnType<typeof lookOf>;

function animateAction(
  element: HTMLElement,
  shown: boolean,
  now: ElementLook | null,
  t: Timings,
) {
  const rest = lookOf(element);
  const away = t.reduce
    ? { opacity: '0' }
    : {
        opacity: '0',
        scale: String(Number(rest.scale) * motionTokens.scale.action),
        filter: motionTokens.blur.icon,
      };
  const here = t.reduce
    ? { opacity: rest.opacity }
    : { opacity: rest.opacity, scale: rest.scale, filter: 'blur(0px)' };
  const from = now
    ? t.reduce
      ? { opacity: now.opacity }
      : { opacity: now.opacity, scale: now.scale, filter: now.filter }
    : shown
      ? away
      : here;
  const timing = t.reduce ? t.fade : t.swap;
  const animation = track(
    element,
    startNow(
      element.animate([from, shown ? here : away], {
        duration: timing.duration,
        easing: timing.easing,
        fill: 'both',
      }),
    ),
  );
  void animation.finished.then(
    () => {
      if (!isCurrent(element, animation)) return;
      if (element.hasAttribute('data-hidden')) element.hidden = true;
      unpin(element);
      stop(element);
    },
    () => {},
  );
}

function changeActions(
  showing: HTMLElement[],
  hiding: HTMLElement[],
  t: Timings,
  was: Map<HTMLElement, Map<string, string | null>>,
) {
  const all = [...showing, ...hiding];
  const looks = new Map(
    all.map((element) => [
      element,
      running.has(element) ? lookOf(element) : null,
    ]),
  );
  for (const element of all) {
    stop(element);
    unpin(element);
  }
  for (const element of showing) element.hidden = true;
  for (const element of hiding) element.hidden = false;
  const now = new Map<HTMLElement, Map<string, string | null>>();
  for (const element of hiding) {
    const before = was.get(element);
    if (!before) continue;
    const current = new Map<string, string | null>();
    for (const [name, value] of before) {
      current.set(name, element.getAttribute(name));
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
    now.set(element, current);
  }
  const boxes = hiding.map((element) =>
    element.parentElement ? boxIn(element.parentElement, element) : null,
  );
  for (const element of hiding)
    if (!looks.get(element)) looks.set(element, lookOf(element));
  for (const [element, current] of now)
    for (const [name, value] of current) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  for (const element of showing) element.hidden = false;
  hiding.forEach((element, i) => {
    const box = boxes[i];
    if (box) pin(element, () => box);
    animateAction(element, false, looks.get(element) ?? null, t);
  });
  for (const element of showing)
    animateAction(element, true, looks.get(element) ?? null, t);
}

function useQuestionnaireMotion(
  root: HTMLFormElement | null,
  timings: React.RefObject<Timings | null>,
) {
  React.useLayoutEffect(() => {
    if (!root) return;
    let painted = false;
    const cancelFrame = onNextFrame(() => {
      painted = true;
      root.setAttribute(READY_ATTRIBUTE, '');
    });
    const observer = new MutationObserver((records) => {
      if (!painted) return;
      const before = new Map<HTMLElement, Map<string, boolean>>();
      const actionStates = new Map<HTMLElement, Map<string, string | null>>();
      for (const record of records) {
        const element = record.target;
        if (!(element instanceof HTMLElement)) continue;
        if (element.closest(`[${ROOT_ATTRIBUTE}]`) !== root) continue;
        const name = record.attributeName!;
        const states = before.get(element) ?? new Map<string, boolean>();
        if (!states.has(name)) states.set(name, record.oldValue !== null);
        before.set(element, states);
        if (
          STATE_ATTRIBUTES.includes(name) &&
          element.getAttribute(PART_ATTRIBUTE) === 'action'
        ) {
          const old = actionStates.get(element) ?? new Map();
          if (!old.has(name)) old.set(name, record.oldValue);
          actionStates.set(element, old);
        }
      }
      const t = timings.current;
      if (!t) return;
      const left: HTMLElement[] = [];
      const came: HTMLElement[] = [];
      const showing: HTMLElement[] = [];
      const hiding: HTMLElement[] = [];
      const errors: [HTMLElement, boolean][] = [];
      for (const [element, states] of before) {
        const part = element.getAttribute(PART_ATTRIBUTE);
        for (const [name, had] of states) {
          const has = element.hasAttribute(name);
          if (had === has) continue;
          if (part === 'item' && name === 'data-active')
            (has ? came : left).push(element);
          else if (part === 'choice' && name === 'data-checked')
            toggleChoice(element, has, t);
          else if (part === 'error' && name === 'data-invalid')
            errors.push([element, has]);
          else if (part === 'action' && name === 'data-hidden')
            (has ? hiding : showing).push(element);
        }
      }
      for (const [element, has] of errors) if (!has) element.hidden = false;
      if (left[0] && came[0]) changeStep(left[0], came[0], t);
      if (showing.length || hiding.length)
        changeActions(showing, hiding, t, actionStates);
      for (const [element, has] of errors) toggleError(element, has, t);
    });
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: [
        'data-active',
        'data-checked',
        'data-invalid',
        'data-hidden',
        ...STATE_ATTRIBUTES,
      ],
    });
    return () => {
      observer.disconnect();
      cancelFrame();
      root.removeAttribute(READY_ATTRIBUTE);
    };
  }, [root, timings]);
}

type RootProps = React.ComponentProps<typeof QuestionnairePrimitive.Root>;

function Root({ ref, children, style, ...props }: RootProps) {
  const [root, setRoot] = React.useState<HTMLFormElement | null>(null);
  const mergedRef = React.useMemo(
    () => mergeRefs<HTMLFormElement>(ref, setRoot),
    [ref],
  );

  const reduce = useShouldReduceMotion();
  const out = toCssTiming(useTempoTransition(motionTokens.transition.panelOut));
  const into = toCssTiming(useTempoTransition(motionTokens.transition.panelIn));
  const fade = toCssTiming(useTempoTransition(motionTokens.transition.fade));
  const height = toCssTiming(
    useTempoTransition(motionTokens.transition.panelHeight),
  );
  const disclosure = toCssTiming(
    useTempoTransition(motionTokens.transition.disclosure),
  );
  const swap = toCssTiming(useTempoTransition(motionTokens.transition.swap));
  const color = toCssTiming(useTempoTransition(motionTokens.transition.color));
  const animation = useCheckAnimation();
  const checkIn = useTempoTransition(
    animation === 'pop' ? POP_TRANSITION : CHECK_TRANSITION,
  );
  const checkOut = useTempoTransition(
    animation === 'pop' ? POP_EXIT_TRANSITION : CHECK_EXIT_TRANSITION,
  );
  const dot = useTempoTransition(DOT_TRANSITION);
  const follow = useTempoTransition(motionTokens.spring.morph);

  const timingsRef = React.useRef<Timings | null>(null);
  React.useLayoutEffect(() => {
    timingsRef.current = {
      out,
      in: into,
      fade,
      height,
      follow,
      disclosure,
      swap,
      check: { enter: checkIn, exit: checkOut, animation },
      dot,
      reduce,
    };
  });

  useQuestionnaireMotion(root, timingsRef);

  return (
    <>
      <style href="animate-ui-questionnaire" precedence="animate-ui">
        {QUESTIONNAIRE_CSS}
      </style>
      <QuestionnairePrimitive.Root
        ref={mergedRef}
        {...{ [ROOT_ATTRIBUTE]: '' }}
        style={
          {
            [COLOR_DURATION_VAR]: `${color.duration}ms`,
            [COLOR_EASING_VAR]: color.easing,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </QuestionnairePrimitive.Root>
    </>
  );
}

const part = (name: string) => ({ [PART_ATTRIBUTE]: name });

function Item(props: React.ComponentProps<typeof QuestionnairePrimitive.Item>) {
  return <QuestionnairePrimitive.Item {...part('item')} {...props} />;
}

type ChoiceProps = React.ComponentProps<typeof QuestionnairePrimitive.Choice>;

function Choice({ render, ...props }: ChoiceProps) {
  const press = usePressMotion({
    disabled: props.disabled,
    scale: motionTokens.scale.choice,
  });
  if (render !== undefined)
    return (
      <QuestionnairePrimitive.Choice
        {...part('choice')}
        render={render}
        {...props}
      />
    );
  return (
    <QuestionnairePrimitive.Choice
      {...part('choice')}
      {...props}
      render={(rendered, state) => (
        <motion.label
          {...(rendered as React.ComponentProps<typeof motion.label>)}
          {...(state.disabled ? {} : press)}
        />
      )}
    />
  );
}

function ErrorPart(
  props: React.ComponentProps<typeof QuestionnairePrimitive.Error>,
) {
  return <QuestionnairePrimitive.Error {...part('error')} {...props} />;
}

function Previous(
  props: React.ComponentProps<typeof QuestionnairePrimitive.Previous>,
) {
  return <QuestionnairePrimitive.Previous {...part('action')} {...props} />;
}

function Skip(props: React.ComponentProps<typeof QuestionnairePrimitive.Skip>) {
  return <QuestionnairePrimitive.Skip {...part('action')} {...props} />;
}

function Next(props: React.ComponentProps<typeof QuestionnairePrimitive.Next>) {
  return <QuestionnairePrimitive.Next {...part('action')} {...props} />;
}

function Submit(
  props: React.ComponentProps<typeof QuestionnairePrimitive.Submit>,
) {
  return <QuestionnairePrimitive.Submit {...part('action')} {...props} />;
}

function Count({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const lastRef = React.useRef(value);
  const paintedRef = React.useRef(false);
  React.useLayoutEffect(
    () => onNextFrame(() => (paintedRef.current = true)),
    [],
  );
  const reduce = useShouldReduceMotion();
  const timing = toCssTiming(useTempoTransition(motionTokens.spring.slide));
  const fade = toCssTiming(useTempoTransition(motionTokens.transition.fade));
  const latestRef = React.useRef({ reduce, timing, fade });
  React.useLayoutEffect(() => {
    latestRef.current = { reduce, timing, fade };
  });

  React.useLayoutEffect(() => {
    const element = ref.current;
    const last = lastRef.current;
    lastRef.current = value;
    if (!element || last === value) return;
    const item = element.closest(`[${PART_ATTRIBUTE}="item"]`);
    if (item) {
      if (item.hasAttribute('data-active'))
        element.removeAttribute(HOLD_ATTRIBUTE);
      else if (!element.hasAttribute(HOLD_ATTRIBUTE))
        element.setAttribute(HOLD_ATTRIBUTE, String(last));
      return;
    }
    if (!paintedRef.current || typeof element.animate !== 'function') return;
    const { reduce, timing, fade } = latestRef.current;
    const rolling = element.hasAttribute(FROM_ATTRIBUTE);
    const from = rolling
      ? Number(element.getAttribute(TO_ATTRIBUTE) ?? last)
      : last;
    const leaving = rolling ? lookOf(element, '::after') : null;
    stop(element);
    element.setAttribute(FROM_ATTRIBUTE, String(from));
    element.setAttribute(TO_ATTRIBUTE, String(value));
    const way = value > from ? 1 : -1;
    const away = (side: number) =>
      reduce
        ? { opacity: '0' }
        : {
            opacity: '0',
            translate: `0px ${side * COUNT_SHIFT}em`,
            filter: motionTokens.blur.icon,
          };
    const here = reduce
      ? { opacity: '1' }
      : { opacity: '1', translate: '0px 0px', filter: 'blur(0px)' };
    const start = leaving
      ? reduce
        ? { opacity: leaving.opacity }
        : {
            opacity: leaving.opacity,
            translate: leaving.translate,
            filter: leaving.filter,
          }
      : here;
    const { duration, easing } = reduce ? fade : timing;
    track(
      element,
      startNow(
        element.animate([start, away(-way)], {
          duration,
          easing,
          fill: 'both',
          pseudoElement: '::before',
        }),
      ),
    );
    const into = track(
      element,
      startNow(
        element.animate([away(way), here], {
          duration,
          easing,
          fill: 'both',
          pseudoElement: '::after',
        }),
      ),
    );
    void into.finished.then(
      () => {
        if (!isCurrent(element, into)) return;
        element.removeAttribute(FROM_ATTRIBUTE);
        element.removeAttribute(TO_ATTRIBUTE);
        stop(element);
      },
      () => {},
    );
  }, [value]);

  return (
    <span ref={ref} {...{ [COUNT_ATTRIBUTE]: '' }}>
      {value}
    </span>
  );
}

type ProgressProps = React.ComponentProps<
  typeof QuestionnairePrimitive.Progress
>;

function Progress({ children, render, ...props }: ProgressProps) {
  if (children !== undefined || render !== undefined)
    return (
      <QuestionnairePrimitive.Progress render={render} {...props}>
        {children}
      </QuestionnairePrimitive.Progress>
    );
  return (
    <QuestionnairePrimitive.Progress
      {...props}
      render={(rendered, state) => (
        <div {...rendered}>
          {state.total ? (
            <>
              Question <Count value={state.current} /> of{' '}
              <Count value={state.total} />
            </>
          ) : null}
        </div>
      )}
    />
  );
}

const Questionnaire: typeof QuestionnairePrimitive = {
  Root,
  Progress,
  Item,
  Title: QuestionnairePrimitive.Title,
  Description: QuestionnairePrimitive.Description,
  Choices: QuestionnairePrimitive.Choices,
  Choice,
  ChoiceInput: QuestionnairePrimitive.ChoiceInput,
  ChoiceLabel: QuestionnairePrimitive.ChoiceLabel,
  ChoiceShortcut: QuestionnairePrimitive.ChoiceShortcut,
  Input: QuestionnairePrimitive.Input,
  Error: ErrorPart,
  Previous,
  Skip,
  Next,
  Submit,
};

export { Questionnaire };
export type {
  QuestionnaireChoiceDefinition,
  QuestionnaireInputType,
  QuestionnaireItemDefinition,
  QuestionnaireItemStatus,
  QuestionnaireShortcutMode,
} from '@shadcn/react/questionnaire';
