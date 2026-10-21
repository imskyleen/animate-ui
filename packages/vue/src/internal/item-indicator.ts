import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  useCheckAnimation,
  useShouldReduceMotion,
  useTempoTransition,
  type CheckAnimation,
} from '../utils/motion';
import {
  animateTo,
  anyShown,
  drawn,
  forget,
  setNow,
  targetsOf,
} from './controls/indicator';
import { glideFrom, stopGlide } from './glide';

const DRAW_TRANSITION: Transition = {
  ...motionTokens.transition.check,
  delay: 0,
};
const ERASE_TRANSITION: Transition = motionTokens.transition.uncheck;
const POP_TRANSITION: Transition = motionTokens.spring.checkPop;
const UNPOP_TRANSITION: Transition = motionTokens.transition.popOut;
export const GLIDE_TRANSITION = motionTokens.spring.highlight;

export const PICK_HOLD: Record<CheckAnimation, number> = {
  draw: 0.25,
  pop: 0.15,
};

export type Picked = CheckAnimation | false;

export type ItemCheckAnimationProps = {
  animation?: CheckAnimation;
  transition?: Transition;
};

export function usePickHold() {
  const draw = useTempoTransition(() => ({ delay: PICK_HOLD.draw }));
  const pop = useTempoTransition(() => ({ delay: PICK_HOLD.pop }));
  return (look: CheckAnimation) =>
    ((look === 'draw' ? draw.value : pop.value) as { delay?: number }).delay ??
    0;
}

type IndicatorHandle = {
  element: HTMLElement;
  toggle: (shown: boolean, animated: boolean) => void;
  isShown: () => boolean;
};

type GroupReport = {
  handle: IndicatorHandle;
  shown: boolean;
  reduce: boolean;
  glide: Transition;
  rect?: DOMRect;
};

export type CheckGroup = { report: (report: GroupReport) => void };

/** A radio group's checks: the one leaving hands its place to the one coming. */
export function createCheckGroup(): CheckGroup {
  let pending: GroupReport[] = [];
  const settle = () => {
    const reports = pending;
    pending = [];
    const last = new Map(reports.map((r) => [r.handle.element, r]));
    const shown = [...last.values()].filter((r) => r.shown);
    const hidden = [...last.values()].filter((r) => !r.shown);
    const to = shown.length === 1 ? shown[0]! : null;
    const from =
      to && !to.reduce ? hidden.find((r) => r.handle.isShown()) : undefined;
    if (to && from) {
      const start = from.rect ?? from.handle.element.getBoundingClientRect();
      for (const r of hidden) {
        stopGlide(r.handle.element);
        r.handle.toggle(false, false);
      }
      to.handle.toggle(true, false);
      glideFrom(to.handle.element, start, to.glide);
      return;
    }
    for (const r of hidden) r.handle.toggle(false, true);
    for (const r of shown) r.handle.toggle(true, true);
  };
  return {
    report: (report) => {
      if (pending.length === 0) queueMicrotask(settle);
      pending.push(report);
    },
  };
}

type RegisterCheck = (element: Element, look: CheckAnimation) => () => void;

export type Picks = {
  markPick: (look: CheckAnimation) => void;
  hasCheck: (item?: Element | null) => boolean;
  checkOf: (item?: Element | null) => Picked;
};

const CheckRegistryKey: InjectionKey<RegisterCheck> = Symbol(
  'AnimateUICheckRegistry',
);
export const PickKey: InjectionKey<Picks> = Symbol('AnimateUIPicks');

/** Remembers which checks an item holds, and whether a pick just happened. */
export function providePicks() {
  const checks = new Map<Element, CheckAnimation>();
  const registerCheck: RegisterCheck = (element, look) => {
    checks.set(element, look);
    return () => checks.delete(element);
  };
  const checkOf = (item?: Element | null): Picked => {
    let found: Picked = false;
    for (const [check, look] of checks) {
      if (item && !item.contains(check)) continue;
      if (look === 'draw') return 'draw';
      found = look;
    }
    return found;
  };
  let picking: Picked = false;
  const picks: Picks = {
    markPick: (look) => {
      if (picking !== 'draw') picking = look;
      setTimeout(() => {
        picking = false;
      });
    },
    hasCheck: (item) => checkOf(item) !== false,
    checkOf,
  };
  provide(PickKey, picks);
  provide(CheckRegistryKey, registerCheck);
  return { picks, wasPicked: () => picking };
}

const settledLists = new WeakSet<Element>();

function inSettledList(check: Element | null) {
  const list = check?.closest('[role="menu"], [role="listbox"]');
  if (!list) return true;
  if (settledLists.has(list)) return true;
  requestAnimationFrame(() => settledLists.add(list));
  return false;
}

function asTransformable(node: HTMLElement) {
  if (getComputedStyle(node).display !== 'inline') return;
  const alone = node.parentElement?.childNodes.length === 1;
  node.style.setProperty('display', alone ? 'block' : 'inline-block');
}

/**
 * A menu item's check: it draws (or pops) in as the item gets checked, and
 * out as it's unchecked. In a list that just opened it shows at rest; in a
 * radio group of popped checks, the new check glides in from the old one.
 */
export const ItemCheck = defineComponent({
  name: 'AnimatedItemCheck',
  inheritAttrs: false,
  props: {
    multiple: Boolean,
    group: Object as PropType<CheckGroup | null>,
    checked: Boolean,
    indeterminate: Boolean,
    animation: String as PropType<CheckAnimation>,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const element = ref<HTMLElement | null>(null);
    const look = useCheckAnimation(() => props.animation);
    const reduce = useShouldReduceMotion();
    const glide = useTempoTransition(
      () => props.transition ?? GLIDE_TRANSITION,
    );
    const enter = useTempoTransition(
      () =>
        props.transition ??
        (look.value === 'pop' ? POP_TRANSITION : DRAW_TRANSITION),
    );
    const exit = useTempoTransition(
      () =>
        props.transition ??
        (look.value === 'pop' ? UNPOP_TRANSITION : ERASE_TRANSITION),
    );
    const gliding = () =>
      look.value === 'pop' && !props.multiple && Boolean(props.group);
    const register = inject(CheckRegistryKey, null);
    let unregister: (() => void) | undefined;
    let last: {
      visible: boolean;
      animation: CheckAnimation;
      content: Element[];
    } | null = null;

    const content = () =>
      element.value ? Array.from(element.value.children) : [];
    const lookOf = () => ({ kind: 'check' as const, animation: look.value });
    const targets = () => {
      const children = content();
      return children.length > 0
        ? targetsOf(children, lookOf())
        : element.value
          ? [element.value]
          : [];
    };
    const enterTransition = () =>
      props.indeterminate ? { ...enter.value, delay: 0 } : enter.value;
    const handle = (): IndicatorHandle => ({
      element: element.value!,
      toggle: (shown, animated) => {
        if (!animated) setNow(targets(), lookOf(), shown, reduce.value);
        else
          void animateTo(
            targets(),
            lookOf(),
            shown,
            shown ? enterTransition() : exit.value,
            reduce.value,
          );
      },
      isShown: () => anyShown(targets()),
    });
    const coordinate = (shown: boolean) =>
      props.group?.report({
        handle: handle(),
        shown,
        reduce: reduce.value,
        glide: glide.value,
      });

    const sync = () => {
      const el = element.value;
      if (!el) return;
      const visible = props.checked;
      const list = content();
      if (!last) {
        last = { visible, animation: look.value, content: list };
        if (!visible || !inSettledList(el))
          setNow(targets(), lookOf(), visible, reduce.value);
        else if (gliding()) {
          setNow(targets(), lookOf(), false, reduce.value);
          coordinate(true);
        } else
          void animateTo(
            targets(),
            lookOf(),
            true,
            enterTransition(),
            reduce.value,
          );
        return;
      }
      const previous = last;
      last = { visible, animation: look.value, content: list };
      if (previous.animation !== look.value) {
        forget([el, ...previous.content]);
        setNow(targets(), lookOf(), visible, reduce.value);
        return;
      }
      if (previous.visible === visible) {
        const fresh = targets().filter((t) => !drawn.has(t));
        if (visible && fresh.length > 0)
          void animateTo(
            fresh,
            lookOf(),
            true,
            enterTransition(),
            reduce.value,
          );
        return;
      }
      if (gliding()) {
        coordinate(visible);
        return;
      }
      void animateTo(
        targets(),
        lookOf(),
        visible,
        visible ? enterTransition() : exit.value,
        reduce.value,
      );
    };

    onMounted(() => {
      const el = element.value;
      if (!el) return;
      if (gliding()) asTransformable(el);
      unregister = register?.(el, look.value);
      sync();
    });
    watch(look, (value) => {
      unregister?.();
      if (element.value) unregister = register?.(element.value, value);
    });
    onUpdated(sync);
    watch(() => [props.checked, props.indeterminate, look.value], sync, {
      flush: 'post',
    });
    onBeforeUnmount(() => {
      unregister?.();
      const el = element.value;
      if (!gliding() || !props.group || !props.checked || !el?.isConnected)
        return;
      props.group.report({
        handle: { element: el, toggle: () => {}, isShown: () => true },
        shown: false,
        rect: el.getBoundingClientRect(),
        reduce: reduce.value,
        glide: glide.value,
      });
    });

    return () => h('span', { ...attrs, ref: element }, slots.default?.());
  },
});
