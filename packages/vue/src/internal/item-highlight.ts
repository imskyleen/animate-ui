import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from 'vue';
import {
  createGeneratorEasing,
  generateLinearEasing,
  spring as springGenerator,
  type Transition,
} from 'motion-v';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';
import { layoutScale } from './layout-scale';
import { staggerLeft } from './stagger';

export const HIGHLIGHT_TRANSITION = motionTokens.spring.highlight;
const FADE_TRANSITION = motionTokens.transition.color;
const RESUME_TRANSITION = motionTokens.transition.fade;

type Surface = {
  backgroundColor: string;
  backgroundImage: string;
  borderRadius: string;
};

type Offset = { x: number; y: number; scaleX: number; scaleY: number };

type Glide = {
  animation: Animation;
  ease: (progress: number) => number;
  duration: number;
  from: Offset;
};

type SurfaceHandle = {
  id: string;
  element: HTMLElement;
  item: HTMLElement;
  glide: Glide | null;
};

type Leaving = { id: string; to: HTMLElement | null; key: number };

type Start = {
  offset: Offset;
  opacity: number;
  color: string | null;
  fresh: boolean;
  velocity: Offset;
  cross: boolean;
  enters: boolean;
};

export type HighlightScope = {
  activeId: Ref<string | null>;
  leaving: Ref<readonly Leaving[]>;
  slot: string;
  light: (id: string, item: HTMLElement) => void;
  unlight: (id: string) => void;
  left: (id: string) => void;
  handOff: (item: HTMLElement, reduce: boolean) => Start;
  startOf: (id: string, item: HTMLElement, reduce: boolean) => Start;
  leavingStartOf: (id: string, item: HTMLElement, reduce: boolean) => Start;
  register: (handle: SurfaceHandle) => () => void;
  gone: (opacity: number) => void;
  paint: (surface: Surface) => Surface;
};

const ItemScopeKey: InjectionKey<HighlightScope> = Symbol(
  'AnimateUIItemHighlight',
);
const TriggerScopeKey: InjectionKey<HighlightScope> = Symbol(
  'AnimateUITriggerHighlight',
);

const without = (list: readonly Leaving[], id: string) =>
  list.some((other) => other.id === id)
    ? list.filter((other) => other.id !== id)
    : list;

function clipperOf(item: HTMLElement) {
  const body = item.ownerDocument.body;
  for (let el = item.parentElement; el && el !== body; el = el.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (overflowX !== 'visible' || overflowY !== 'visible') return el;
  }
  return null;
}

const crossesClip = (from: HTMLElement, to: HTMLElement) =>
  clipperOf(from) !== clipperOf(to);

// Out of a clipped box into the one around it, the one leaving is cut on the
// way: it fades out under the one coming in, whole at once. Otherwise the one
// coming in fades in over the one leaving.
const comesOut = (from: HTMLElement, to: HTMLElement) => {
  const inner = clipperOf(from);
  const outer = clipperOf(to);
  return !!inner && !inner.contains(to) && (!outer || outer.contains(from));
};

function createScope(
  open: () => boolean,
  slot: string,
  reduce: () => boolean,
): HighlightScope {
  const activeId = ref<string | null>(null);
  const leaving = shallowRef<readonly Leaving[]>([]);
  let surface: SurfaceHandle | null = null;
  let key = 0;
  let painted: Surface | null = null;
  const lit = new Map<string, HTMLElement>();
  let gone: { opacity: number; at: number } | null = null;
  // Read as an item lights up, before the surface it takes over unmounts.
  const starts = new Map<string, Start>();
  // Leaving copies remount on every hand-off: they start from the surface as it is now, not once it has unmounted.
  const leavingStarts = new Map<string, Start>();
  const items = new Map<string, HTMLElement>();
  const holdStarts = (list: readonly Leaving[]) => {
    for (const other of list) {
      const item = items.get(other.id);
      if (item) leavingStarts.set(other.id, handOffFrom(item, reduce()));
    }
  };
  const handOffFrom = (item: HTMLElement, reduced: boolean) => {
    const start = handOff(surface, item, reduced);
    if (
      !surface?.element.isConnected &&
      gone &&
      performance.now() - gone.at < 120
    )
      return { ...start, opacity: gone.opacity, fresh: false };
    return start;
  };

  watch(open, (now) => {
    if (!now) return;
    activeId.value = null;
    leaving.value = [];
  });

  const activate = (id: string, item: HTMLElement) => {
    const previous = surface;
    starts.set(id, handOffFrom(item, reduce()));
    activeId.value = id;
    const moves =
      previous && previous.id !== id && previous.element.isConnected
        ? previous
        : null;
    const cross = moves !== null && crossesClip(moves.item, item);
    const k = (key += 1);
    const rest = without(leaving.value, id).filter(
      (other) => other.to !== null,
    );
    if (!moves || (!cross && rest.length === 0)) {
      leaving.value = rest;
      return;
    }
    const along = rest.map((other) => ({ ...other, to: item, key: k }));
    const next = cross
      ? [...without(along, moves.id), { id: moves.id, to: item, key: k }]
      : along;
    holdStarts(next);
    leaving.value = next;
  };

  return {
    activeId,
    leaving,
    slot,
    light: (id, item) => {
      items.set(id, item);
      lit.delete(id);
      lit.set(id, item);
      activate(id, item);
    },
    unlight: (id) => {
      if (!lit.delete(id) || activeId.value !== id) return;
      const next = [...lit].at(-1);
      if (next) {
        activate(...next);
        return;
      }
      activeId.value = null;
      const k = (key += 1);
      const fading = { id, to: null, key: k };
      holdStarts([fading]);
      leaving.value = [...without(leaving.value, id), fading];
    },
    left: (id) => {
      leaving.value = without(leaving.value, id);
    },
    handOff: handOffFrom,
    startOf: (id, item, reduced) => {
      const start = starts.get(id);
      starts.delete(id);
      return start ?? handOffFrom(item, reduced);
    },
    leavingStartOf: (id, item, reduced) => {
      const start = leavingStarts.get(id);
      leavingStarts.delete(id);
      return start ?? handOffFrom(item, reduced);
    },
    register: (handle) => {
      surface = handle;
      return () => {
        if (surface === handle) surface = null;
      };
    },
    gone: (opacity) => {
      gone = { opacity, at: performance.now() };
    },
    paint: (next) => {
      if (isBare(next)) return painted ?? next;
      painted = next;
      return next;
    },
  };
}

/** One highlight for a list of items, handed from item to item. */
export function provideHighlightScope(
  open: () => boolean,
  { shared = false }: { shared?: boolean } = {},
) {
  const parent = inject(ItemScopeKey, null);
  if (shared && parent) return parent;
  const reduce = useShouldReduceMotion();
  const scope = createScope(open, 'item-highlight', () => reduce.value);
  provide(ItemScopeKey, scope);
  return scope;
}

/** One highlight for a row of triggers (a menubar's). */
export function provideTriggerHighlightScope() {
  const reduce = useShouldReduceMotion();
  const scope = createScope(
    () => true,
    'trigger-highlight',
    () => reduce.value,
  );
  provide(TriggerScopeKey, scope);
  return scope;
}

const SURFACE_PROPERTIES = ['background-color', 'background-image'] as const;
type SavedStyle = [property: string, value: string, priority: string][];
const savedStyles = new WeakMap<HTMLElement, SavedStyle>();

function save(node: HTMLElement, properties: readonly string[]): SavedStyle {
  return properties.map((property) => [
    property,
    node.style.getPropertyValue(property),
    node.style.getPropertyPriority(property),
  ]);
}

function restore(node: HTMLElement, saved: SavedStyle) {
  for (const [property, value, priority] of saved) {
    if (value) node.style.setProperty(property, value, priority);
    else node.style.removeProperty(property);
  }
}

function clearOwnSurface(node: HTMLElement, clear: boolean) {
  const saved = savedStyles.get(node);
  if (clear && !saved) {
    savedStyles.set(node, save(node, SURFACE_PROPERTIES));
    node.style.setProperty('background-color', 'transparent', 'important');
    node.style.setProperty('background-image', 'none', 'important');
  } else if (!clear && saved) {
    savedStyles.delete(node);
    restore(node, saved);
  }
}

const isBare = ({ backgroundColor, backgroundImage }: Surface) =>
  backgroundImage === 'none' &&
  (backgroundColor === 'transparent' ||
    /^rgba\(.*,\s*0\)$/.test(backgroundColor));

/** A surface painted in the color behind it shows nothing: a highlight may glide over it. */
function blendsIn(node: HTMLElement, surface: Surface) {
  if (surface.backgroundImage !== 'none' || isBare(surface)) return false;
  for (let el = node.parentElement; el; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (style.backgroundImage !== 'none') return false;
    const backdrop = { ...surface, backgroundColor: style.backgroundColor };
    if (!isBare(backdrop))
      return style.backgroundColor === surface.backgroundColor;
  }
  return false;
}

function readSurface(node: HTMLElement): Surface {
  const cleared = savedStyles.get(node);
  const transition = save(node, ['transition']);
  node.style.setProperty('transition', 'none', 'important');
  if (cleared) restore(node, cleared);
  const style = getComputedStyle(node);
  const surface = {
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    borderRadius: style.borderRadius,
  };
  if (cleared) {
    node.style.setProperty('background-color', 'transparent', 'important');
    node.style.setProperty('background-image', 'none', 'important');
  }
  void getComputedStyle(node).backgroundColor;
  restore(node, transition);
  return surface;
}

const isExpanded = (node: HTMLElement) =>
  node.getAttribute('aria-expanded') === 'true';

const samePaint = (a: Surface | null, b: Surface) =>
  a !== null &&
  a.backgroundColor === b.backgroundColor &&
  a.backgroundImage === b.backgroundImage &&
  a.borderRadius === b.borderRadius;

const TRIGGER_ATTRIBUTES = [
  'aria-expanded',
  'data-state',
  'data-highlighted',
  'data-popup-open',
  'data-pressed',
  'data-disabled',
];

export type ItemHighlight = {
  setElement: (element: HTMLElement | null) => void;
  render: () => VNode[];
};

/** An item's part in its list's highlight: lit while `data-highlighted`. */
export function useItemHighlight(
  disabled: () => boolean | undefined,
  {
    attribute = 'data-highlighted',
    followFocus = false,
  }: { attribute?: string; followFocus?: boolean } = {},
): ItemHighlight {
  return useHighlightIn(
    inject(ItemScopeKey, null),
    disabled,
    attribute,
    false,
    followFocus,
  );
}

/** A trigger's part in its row's highlight: lit while hovered, focused or open. */
export function useTriggerHighlight(
  disabled: () => boolean | undefined,
  { beside = false }: { beside?: boolean } = {},
): ItemHighlight {
  return useHighlightIn(inject(TriggerScopeKey, null), disabled, null, beside);
}

function useHighlightIn(
  scope: HighlightScope | null,
  disabled: () => boolean | undefined,
  attribute: string | null,
  beside = false,
  followFocus = false,
): ItemHighlight {
  const id = useId();
  const node = shallowRef<HTMLElement | null>(null);
  const surface = shallowRef<Surface | null>(null);

  watch(
    [node, disabled],
    ([el, off], _, onCleanup) => {
      if (!scope || !el) return;
      if (attribute === null) {
        if (!beside && getComputedStyle(el).position === 'static')
          el.style.setProperty('position', 'relative');
        let hovered = false;
        let lit = false;
        let frame = 0;
        const sync = () => {
          const interactive =
            !off && (hovered || isExpanded(el) || el.matches(':focus'));
          if (interactive) clearOwnSurface(el, true);
          const read = interactive ? readSurface(el) : null;
          const now = read !== null && !isBare(read);
          if (read && now && !samePaint(surface.value, read))
            surface.value = read;
          clearOwnSurface(
            el,
            now || (!interactive && blendsIn(el, readSurface(el))),
          );
          if (now === lit) return;
          lit = now;
          if (now) scope.light(id, el);
          else scope.unlight(id);
        };
        const enter = () => {
          hovered = true;
          sync();
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(sync);
        };
        const leave = () => {
          hovered = false;
          cancelAnimationFrame(frame);
          sync();
        };
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(el, {
          attributes: true,
          attributeFilter: TRIGGER_ATTRIBUTES,
        });
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
        el.addEventListener('focus', sync);
        el.addEventListener('blur', sync);
        onCleanup(() => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointerleave', leave);
          el.removeEventListener('focus', sync);
          el.removeEventListener('blur', sync);
          clearOwnSurface(el, false);
          if (lit) scope.unlight(id);
        });
        return;
      }

      if (getComputedStyle(el).position === 'static')
        el.style.setProperty('position', 'relative');
      const clear = () =>
        clearOwnSurface(
          el,
          el.hasAttribute(attribute) || isExpanded(el) || el.matches(':focus'),
        );
      const sync = () => {
        if (el.hasAttribute(attribute)) {
          surface.value = scope.paint(readSurface(el));
          scope.light(id, el);
        } else if (followFocus) scope.unlight(id);
        clear();
      };
      const focus = () => {
        if (el.hasAttribute(attribute))
          surface.value = scope.paint(readSurface(el));
        clear();
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(el, {
        attributes: true,
        attributeFilter: [attribute, 'aria-expanded'],
      });
      el.addEventListener('focus', focus);
      el.addEventListener('blur', clear);
      onCleanup(() => {
        observer.disconnect();
        el.removeEventListener('focus', focus);
        el.removeEventListener('blur', clear);
        clearOwnSurface(el, false);
      });
    },
    { flush: 'post' },
  );

  return {
    setElement: (element) => {
      if (element && element !== node.value) node.value = element;
    },
    render: () => {
      const item = node.value;
      if (!scope || !surface.value || !item) return [];
      const active = scope.activeId.value === id && !disabled();
      const leaving =
        (!disabled() && scope.leaving.value.find((other) => other.id === id)) ||
        null;
      const copies: VNode[] = [];
      const shared = { id, surface: surface.value, item, scope, beside };
      if (active) copies.push(h(SurfaceCopy, { key: 'active', ...shared }));
      if (leaving && !active)
        copies.push(
          h(SurfaceCopy, {
            key: `leaving-${leaving.key}`,
            ...shared,
            leavingTo: leaving.to,
            fadeOut: leaving.to === null,
          }),
        );
      return copies;
    },
  };
}

function placeOver(element: HTMLElement, item: HTMLElement) {
  const host = element.offsetParent as HTMLElement | null;
  const box = item.getBoundingClientRect();
  const origin = host?.getBoundingClientRect();
  const { x: ratioX, y: ratioY } =
    host && origin ? layoutScale(host, origin) : { x: 1, y: 1 };
  const left = origin
    ? (box.left - origin.left) / ratioX - host!.clientLeft + host!.scrollLeft
    : box.left + window.scrollX;
  const top = origin
    ? (box.top - origin.top) / ratioY - host!.clientTop + host!.scrollTop
    : box.top + window.scrollY;
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  element.style.width = `${box.width / ratioX}px`;
  element.style.height = `${box.height / ratioY}px`;
}

const IN_PLACE: Offset = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const STILL: Offset = { x: 0, y: 0, scaleX: 0, scaleY: 0 };

function velocityOf({ animation, ease, duration, from }: Glide): Offset {
  const time = Number(animation.currentTime ?? duration);
  if (!(time < duration)) return STILL;
  const step = 4;
  const before = Math.max(0, time - step);
  const rate =
    (ease(Math.min(1, (before + step) / duration)) - ease(before / duration)) /
    step;
  return {
    x: -from.x * rate,
    y: -from.y * rate,
    scaleX: (1 - from.scaleX) * rate,
    scaleY: (1 - from.scaleY) * rate,
  };
}

function handOff(
  previous: SurfaceHandle | null,
  item: HTMLElement,
  reduce: boolean,
): Start {
  if (!previous?.element.isConnected)
    return {
      offset: IN_PLACE,
      opacity: 0,
      color: null,
      fresh: true,
      velocity: STILL,
      cross: false,
      enters: false,
    };
  const style = getComputedStyle(previous.element);
  const opacity = Number(style.opacity);
  const color = style.backgroundColor;
  const cross = crossesClip(previous.item, item);
  const enters = cross && !comesOut(previous.item, item);
  const offset = offsetOn(previous.element.getBoundingClientRect(), item);
  if (reduce || !offset)
    return {
      offset: IN_PLACE,
      opacity,
      color,
      fresh: false,
      velocity: STILL,
      cross,
      enters,
    };
  const own = item.getBoundingClientRect();
  const from = previous.item.getBoundingClientRect();
  const velocity = previous.glide ? velocityOf(previous.glide) : STILL;
  return {
    offset,
    opacity,
    color,
    fresh: false,
    velocity: {
      x: velocity.x,
      y: velocity.y,
      scaleX: (velocity.scaleX * from.width) / own.width,
      scaleY: (velocity.scaleY * from.height) / own.height,
    },
    cross,
    enters,
  };
}

function offsetOn(box: DOMRect, item: HTMLElement): Offset | null {
  const own = item.getBoundingClientRect();
  if (!own.width || !own.height) return null;
  const ratioX = own.width / (item.offsetWidth || own.width);
  const ratioY = own.height / (item.offsetHeight || own.height);
  return {
    x: (box.left - own.left) / ratioX,
    y: (box.top - own.top) / ratioY,
    scaleX: box.width / own.width,
    scaleY: box.height / own.height,
  };
}

function initialRate(
  { offset, velocity }: Start,
  to: Offset,
  width: number,
  height: number,
) {
  const way = [
    to.x - offset.x,
    to.y - offset.y,
    (to.scaleX - offset.scaleX) * width,
    (to.scaleY - offset.scaleY) * height,
  ];
  const speed = [
    velocity.x,
    velocity.y,
    velocity.scaleX * width,
    velocity.scaleY * height,
  ];
  const length = way.reduce((sum, d) => sum + d * d, 0);
  if (length < 0.25) return null;
  return way.reduce((sum, d, i) => sum + d * speed[i]!, 0) / length;
}

const toTransform = ({ x, y, scaleX, scaleY }: Offset) =>
  `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;

const SurfaceCopy = defineComponent({
  name: 'HighlightSurface',
  props: {
    id: { type: String, required: true },
    surface: { type: Object as PropType<Surface>, required: true },
    item: { type: Object as PropType<HTMLElement>, required: true },
    scope: { type: Object as PropType<HighlightScope>, required: true },
    leavingTo: { type: Object as PropType<HTMLElement | null>, default: null },
    fadeOut: Boolean,
    beside: Boolean,
  },
  setup(props) {
    const reduce = useShouldReduceMotion();
    const glide = useTempoTransition<Transition>(() => HIGHLIGHT_TRANSITION);
    const fade = useTempoTransition<Transition>(() => FADE_TRANSITION);
    const resume = useTempoTransition<Transition>(() => RESUME_TRANSITION);
    const start =
      props.leavingTo || props.fadeOut
        ? props.scope.leavingStartOf(props.id, props.item, reduce.value)
        : props.scope.startOf(props.id, props.item, reduce.value);
    const target =
      props.leavingTo && !reduce.value
        ? offsetOn(props.leavingTo.getBoundingClientRect(), props.item)
        : null;
    const element = ref<HTMLElement | null>(null);
    let cleanup: (() => void) | undefined;
    let resize: ResizeObserver | undefined;

    onMounted(() => {
      const el = element.value;
      if (!el) return;
      const { id, item, scope } = props;
      if (props.beside) {
        const place = () => placeOver(el, item);
        place();
        resize = new ResizeObserver(place);
        resize.observe(item);
        if (el.offsetParent) resize.observe(el.offsetParent);
      }
      const animations: Animation[] = [];
      let running: Glide | null = null;
      if (props.leavingTo && !target) {
        scope.left(id);
        return;
      }
      const to = target ?? IN_PLACE;
      const rate = initialRate(start, to, item.offsetWidth, item.offsetHeight);
      let timing: { duration: number; easing: string } | null = null;
      if (rate !== null) {
        const { ease, duration } = createGeneratorEasing(
          { ...glide.value, velocity: rate * 1000 * 100 },
          100,
          springGenerator,
        );
        const ms = duration * 1000;
        timing = { duration: ms, easing: generateLinearEasing(ease, ms) };
        const animation = el.animate(
          [
            { transform: toTransform(start.offset) },
            { transform: target ? toTransform(target) : 'none' },
          ],
          { ...timing, fill: target ? 'forwards' : 'auto' },
        );
        animations.push(animation);
        running = { animation, ease, duration: ms, from: start.offset };
      }

      if (target) {
        if (running && comesOut(item, props.leavingTo!))
          animations.push(
            el.animate([{ opacity: 1 }, { opacity: 0 }], {
              ...timing!,
              fill: 'forwards',
            }),
          );
        if (running)
          running.animation.finished.then(
            () => scope.left(id),
            () => {},
          );
        else scope.left(id);
        cleanup = () => {
          for (const animation of animations) animation.cancel();
        };
        return;
      }

      // An item still coming in with its list's stagger: its highlight shows once it has landed.
      const landing = staggerLeft(el.parentElement);
      if (props.fadeOut) {
        const { duration, easing } = toCssTiming(fade.value);
        const fading = el.animate(
          [{ opacity: start.opacity }, { opacity: 0 }],
          { duration, easing, fill: 'forwards' },
        );
        animations.push(fading);
        fading.finished.then(
          () => scope.left(id),
          () => {},
        );
      } else if (start.enters && timing) {
        animations.push(el.animate([{ opacity: 0 }, { opacity: 1 }], timing));
      } else if (start.opacity < 1 || landing > 0) {
        const { duration, easing } = toCssTiming(
          start.fresh || landing > 0 ? fade.value : resume.value,
        );
        animations.push(
          el.animate(
            [{ opacity: landing > 0 ? 0 : start.opacity }, { opacity: 1 }],
            { duration, easing, delay: landing, fill: 'backwards' },
          ),
        );
      }

      const color = getComputedStyle(el).backgroundColor;
      if (start.color && start.color !== color) {
        const { duration, easing } = toCssTiming(fade.value);
        animations.push(
          el.animate(
            [{ backgroundColor: start.color }, { backgroundColor: color }],
            { duration, easing },
          ),
        );
      }

      const unregister = scope.register({
        id,
        element: el,
        item,
        glide: running,
      });
      cleanup = () => {
        const opacity = el.isConnected
          ? Number(getComputedStyle(el).opacity)
          : 0;
        for (const animation of animations) animation.cancel();
        unregister();
        scope.gone(opacity);
      };
    });

    onBeforeUnmount(() => {
      resize?.disconnect();
      cleanup?.();
    });

    return () => {
      const { duration, easing } = toCssTiming(fade.value);
      return h('span', {
        ref: element,
        'aria-hidden': 'true',
        'data-slot': props.scope.slot,
        'data-leaving': props.leavingTo || props.fadeOut ? '' : undefined,
        style: {
          position: 'absolute',
          ...(!props.beside && { inset: 0 }),
          zIndex: -1,
          pointerEvents: 'none',
          transformOrigin: '0 0',
          borderRadius: props.surface.borderRadius,
          backgroundColor: props.surface.backgroundColor,
          backgroundImage: props.surface.backgroundImage,
          transition: `background-color ${duration}ms ${easing}`,
        },
      });
    };
  },
});
