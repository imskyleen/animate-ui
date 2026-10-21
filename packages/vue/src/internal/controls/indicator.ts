import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  watch,
  type PropType,
} from 'vue';
import {
  animate,
  motionValue,
  type AnimationPlaybackControls,
  type MotionValue,
  type Transition,
} from 'motion-v';

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

/**
 * The indicator: its content is drawn in when `checked` turns on, and drawn
 * out when it turns off, then unmounted unless `keepMounted`. Checked on mount,
 * it shows at once.
 */
const IndicatorContent = defineComponent({
  name: 'AnimatedIndicator',
  props: {
    as: { type: String as PropType<'span' | 'div'>, default: 'span' },
    kind: { type: String as PropType<IndicatorKind>, required: true },
    animation: { type: String as PropType<CheckAnimation>, default: 'draw' },
    checked: { type: Boolean, required: true },
    indeterminate: Boolean,
    keepMounted: Boolean,
    transition: Object as PropType<Transition>,
    exitTransition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const element = ref<HTMLElement | null>(null);
    const reduce = useShouldReduceMotion();
    const enter = useTempoTransition(() => {
      const fallback =
        props.kind === 'dot'
          ? DOT_TRANSITION
          : props.animation === 'pop'
            ? POP_TRANSITION
            : CHECK_TRANSITION;
      return props.transition ?? fallback;
    });
    const exit = useTempoTransition(() => {
      if (props.exitTransition) return props.exitTransition;
      if (props.kind === 'dot') return props.transition ?? DOT_TRANSITION;
      return props.animation === 'pop'
        ? POP_EXIT_TRANSITION
        : CHECK_EXIT_TRANSITION;
    });
    const rendered = ref(props.checked || props.keepMounted);
    let run = 0;
    let entering = false;
    let lastAnimation = props.animation;
    let lastContent: Element[] = [];

    const look = computed<Look>(() => ({
      kind: props.kind,
      animation: props.animation,
    }));
    const content = () =>
      element.value ? Array.from(element.value.children) : [];
    const targets = () => {
      const children = content();
      return children.length > 0
        ? targetsOf(children, look.value)
        : element.value
          ? [element.value as Styled]
          : [];
    };
    const enterTransition = () =>
      props.indeterminate ? { ...enter.value, delay: 0 } : enter.value;

    onMounted(() => {
      lastContent = content();
      setNow(targets(), look.value, props.checked, reduce.value);
    });

    watch(
      () => props.animation,
      (animation) => {
        if (animation === lastAnimation) return;
        forget([element.value!, ...lastContent].filter(Boolean));
        lastAnimation = animation;
        setNow(targets(), look.value, props.checked, reduce.value);
      },
      { flush: 'post' },
    );

    watch(
      () => props.checked,
      async (checked) => {
        const id = ++run;
        if (checked) {
          rendered.value = true;
          entering = true;
          await nextTick();
          entering = false;
          lastContent = content();
          void animateTo(
            targets(),
            look.value,
            true,
            enterTransition(),
            reduce.value,
          );
          return;
        }
        await animateTo(targets(), look.value, false, exit.value, reduce.value);
        if (run === id && !props.checked && !props.keepMounted) {
          forget(content());
          rendered.value = false;
        }
      },
    );

    onUpdated(() => {
      if (entering || !props.checked || !element.value) return;
      lastContent = content();
      const fresh = targets().filter((el) => !drawn.has(el));
      if (fresh.length > 0)
        void animateTo(fresh, look.value, true, enterTransition(), reduce.value);
    });

    return () =>
      rendered.value
        ? h(props.as, { ...attrs, ref: element }, slots.default?.())
        : null;
  },
});

export {
  anyShown,
  drawn,
  CHECK_TRANSITION,
  CHECK_EXIT_TRANSITION,
  POP_TRANSITION,
  POP_EXIT_TRANSITION,
  DOT_TRANSITION,
  IndicatorContent,
  animateTo,
  forget,
  setNow,
  targetsOf,
  type Look,
  type CheckAnimationProps,
  type IndicatorKind,
  type IndicatorAnimationProps,
};
