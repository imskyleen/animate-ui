import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  Teleport,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
import type { Transition } from 'motion-v';

import { IconSwap } from '../buttons/_icon-swap';
import {
  provideTriggerHighlightScope,
  useTriggerHighlight,
} from '../../internal/item-highlight';
import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import {
  runCollapse,
  snapshotCollapse,
  stopCollapse,
  type CollapseSnapshot,
  type CollapseTimings,
} from './collapse';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
const MOBILE_BREAKPOINT = 768;

const COLLAPSE_TRANSITION: Transition = motionTokens.transition.collapse;
const LABEL_TRANSITION: Transition = motionTokens.transition.collapseLabel;
const COLOR_TRANSITION: Transition = motionTokens.transition.color;

const SIDEBAR_STYLE = {
  id: 'animate-ui-sidebar',
  css: [
    '[data-sidebar="menu-button"]{transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="group-label"]{transition-property:margin;transition-duration:var(--animate-ui-sidebar-duration,280ms);transition-timing-function:var(--animate-ui-sidebar-easing,cubic-bezier(0.77,0,0.175,1))}',
    '[data-sidebar="rail"],[data-sidebar="rail"]::after{transition-duration:var(--animate-ui-sidebar-color-duration,200ms);transition-timing-function:var(--animate-ui-sidebar-color-easing,ease)}',
    '[data-sidebar="rail"]::after{transition-property:background-color}',
  ].join(''),
};

function injectStyle() {
  if (document.getElementById(SIDEBAR_STYLE.id)) return;
  const style = document.createElement('style');
  style.id = SIDEBAR_STYLE.id;
  style.textContent = SIDEBAR_STYLE.css;
  document.head.appendChild(style);
}

type SidebarContextProps = {
  state: ComputedRef<'expanded' | 'collapsed'>;
  open: Ref<boolean>;
  setOpen: (open: boolean) => void;
  isMobile: Ref<boolean>;
  openMobile: Ref<boolean>;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarKey: InjectionKey<SidebarContextProps> =
  Symbol('AnimateUISidebar');
const AnimateOnHoverKey: InjectionKey<() => boolean> = Symbol(
  'AnimateUISidebarAnimateOnHover',
);

function useSidebar() {
  const context = inject(SidebarKey, null);
  if (!context)
    throw new Error('useSidebar must be used within a SidebarProvider.');
  return context;
}

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function useIsMobile() {
  const isMobile = ref(false);
  let query: MediaQueryList | null = null;
  const update = () => (isMobile.value = query!.matches);
  onMounted(() => {
    query = window.matchMedia(MOBILE_QUERY);
    update();
    query.addEventListener('change', update);
  });
  onBeforeUnmount(() => query?.removeEventListener('change', update));
  return isMobile;
}

type ProviderProps = {
  defaultOpen?: boolean;
  open?: boolean;
  animateOnHover?: boolean;
};

/** Keeps the sidebar's state, its cookie and Cmd/Ctrl+B, and paces its motion. */
const Provider = defineComponent({
  name: 'SidebarProvider',
  inheritAttrs: false,
  props: {
    defaultOpen: { type: Boolean, default: true },
    open: { type: Boolean, default: undefined },
    animateOnHover: { type: Boolean, default: true },
  },
  emits: ['update:open'],
  setup(props, { attrs, slots, emit }) {
    const isMobile = useIsMobile();
    const openMobile = ref(false);
    const own = ref(props.defaultOpen);
    const open = computed({
      get: () => props.open ?? own.value,
      set: (value: boolean) => setOpen(value),
    });
    const setOpen = (value: boolean) => {
      if (props.open === undefined) own.value = value;
      emit('update:open', value);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    };
    const setOpenMobile = (value: boolean) => {
      openMobile.value = value;
    };
    const toggleSidebar = () =>
      isMobile.value
        ? setOpenMobile(!openMobile.value)
        : setOpen(!open.value);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey) &&
        !(event.target as HTMLElement | null)?.closest?.(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    onMounted(() => {
      injectStyle();
      window.addEventListener('keydown', handleKeyDown);
    });
    onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown));

    const state = computed(() => (open.value ? 'expanded' : 'collapsed'));
    provide(SidebarKey, {
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    });
    provide(AnimateOnHoverKey, () => props.animateOnHover);

    const color = useTempoTransition(() => COLOR_TRANSITION);
    const collapse = useTempoTransition(() => COLLAPSE_TRANSITION);
    const reduce = useShouldReduceMotion();

    return () => {
      const colorTiming = toCssTiming(color.value);
      const collapseTiming = toCssTiming(collapse.value);
      return h(
        'div',
        {
          ...attrs,
          style: [
            {
              '--animate-ui-sidebar-color-duration': `${colorTiming.duration}ms`,
              '--animate-ui-sidebar-color-easing': colorTiming.easing,
              '--animate-ui-sidebar-duration': `${reduce.value ? 0 : collapseTiming.duration}ms`,
              '--animate-ui-sidebar-easing': collapseTiming.easing,
            },
            attrs.style,
          ],
        },
        slots.default?.(),
      );
    };
  },
});

function useCssTransition(
  transition: () => Transition,
  properties: string,
) {
  const reduce = useShouldReduceMotion();
  const timing = useTempoTransition(transition);
  return computed(() => {
    const { duration, easing } = toCssTiming(timing.value);
    return {
      transitionProperty: properties,
      transitionDuration: `${reduce.value ? 0 : duration}ms`,
      transitionTimingFunction: easing,
      transitionDelay: '0ms',
    };
  });
}

type GapProps = { transition?: Transition };

/** The space the sidebar takes in the page: its width follows the sidebar's. */
const Gap = defineComponent({
  name: 'SidebarGap',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const timing = useCssTransition(
      () => props.transition ?? COLLAPSE_TRANSITION,
      'width',
    );
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-gap',
          ...attrs,
          style: [timing.value, attrs.style],
        },
        slots.default?.(),
      );
  },
});

type ContainerProps = { transition?: Transition };

/** The fixed panel holding the sidebar: it slides and resizes with it. */
const Container = defineComponent({
  name: 'SidebarContainer',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const timing = useCssTransition(
      () => props.transition ?? COLLAPSE_TRANSITION,
      'left, right, width',
    );
    return () =>
      h(
        'div',
        {
          'data-slot': 'sidebar-container',
          ...attrs,
          style: [timing.value, attrs.style],
        },
        slots.default?.(),
      );
  },
});

const ITEMS = '[data-sidebar="menu-button"], [data-sidebar="menu-sub-button"]';
const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]';
const SURFACE = '[data-slot="trigger-highlight"]';

const roots = new WeakSet<Element>();

type Item = {
  node: HTMLElement;
  host: HTMLElement;
  disabled: boolean;
  key: number;
};

const keys = new WeakMap<HTMLElement, number>();
let nextKey = 0;
function keyOf(node: HTMLElement) {
  let key = keys.get(node);
  if (key === undefined) keys.set(node, (key = nextKey++));
  return key;
}

function closestRoot(node: HTMLElement) {
  for (let el = node.parentElement; el; el = el.parentElement)
    if (roots.has(el)) return el;
  return null;
}

const own = (root: HTMLElement, selector: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (node) => closestRoot(node) === root,
  );

const sameItems = (a: readonly Item[], b: readonly Item[]) =>
  a.length === b.length &&
  a.every(
    (item, i) =>
      item.node === b[i]!.node &&
      item.host === b[i]!.host &&
      item.disabled === b[i]!.disabled,
  );

const onlySurfaces = (record: MutationRecord) =>
  record.type === 'childList' &&
  [...record.addedNodes, ...record.removedNodes].every(
    (node) => node instanceof Element && node.matches(SURFACE),
  );

function useItems(root: Ref<HTMLElement | null>) {
  const items = shallowRef<readonly Item[]>([]);
  const read = (el: HTMLElement) => {
    const found: Item[] = [];
    for (const node of own(el, ITEMS)) {
      const host = node.parentElement;
      if (!host) continue;
      found.push({
        node,
        host,
        disabled: node.matches(DISABLED),
        key: keyOf(node),
      });
    }
    if (!sameItems(items.value, found)) items.value = found;
  };
  watch(
    root,
    (el, _, onCleanup) => {
      if (!el) {
        items.value = [];
        return;
      }
      read(el);
      const observer = new MutationObserver((records) => {
        if (!records.every(onlySurfaces)) read(el);
      });
      observer.observe(el, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'data-sidebar',
          'disabled',
          'aria-disabled',
          'data-disabled',
        ],
      });
      onCleanup(() => observer.disconnect());
    },
    { immediate: true, flush: 'post' },
  );
  return items;
}

const ItemSurface = defineComponent({
  name: 'SidebarItemSurface',
  props: {
    node: { type: Object as PropType<HTMLElement>, required: true },
    host: { type: Object as PropType<HTMLElement>, required: true },
    disabled: Boolean,
  },
  setup(props) {
    const highlight = useTriggerHighlight(() => props.disabled, {
      beside: true,
    });
    watch(
      () => props.node,
      (node) => highlight.setElement(node),
      { immediate: true },
    );
    onBeforeUnmount(() => highlight.setElement(null));
    return () => {
      const nodes = highlight.render();
      return nodes.length ? h(Teleport, { to: props.host }, nodes) : null;
    };
  },
});

type HighlightProps = { animateOnHover?: boolean };

/** The sidebar's content: one highlight glides between its menu buttons, and it collapses with motion. */
const Highlight = defineComponent({
  name: 'SidebarHighlight',
  inheritAttrs: false,
  props: {
    animateOnHover: { type: Boolean, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const inherited = inject(AnimateOnHoverKey, () => true);
    const sidebar = inject(SidebarKey, null);
    const enabled = computed(() => props.animateOnHover ?? inherited());
    const root = shallowRef<HTMLElement | null>(null);
    const items = useItems(computed(() => (enabled.value ? root.value : null)));
    provideTriggerHighlightScope();

    const reduce = useShouldReduceMotion();
    const collapse = useTempoTransition(() => COLLAPSE_TRANSITION);
    const label = useTempoTransition(() => LABEL_TRANSITION);
    const timings = (): CollapseTimings => {
      const c = toCssTiming(collapse.value);
      const l = toCssTiming(label.value);
      return {
        duration: reduce.value ? 0 : c.duration,
        easing: c.easing,
        labelDuration: l.duration,
        labelEasing: l.easing,
        blur: motionTokens.blur.icon,
        reduce: reduce.value,
      };
    };

    let snapshot: CollapseSnapshot | null = null;
    watch(
      () => sidebar?.state.value,
      (state, previous) => {
        snapshot =
          root.value && previous !== undefined && state !== previous
            ? snapshotCollapse(root.value)
            : null;
      },
      { flush: 'pre' },
    );
    watch(
      () => sidebar?.state.value,
      () => {
        if (root.value && snapshot) runCollapse(root.value, snapshot, timings());
        snapshot = null;
      },
      { flush: 'post' },
    );
    onBeforeUnmount(() => {
      if (root.value) stopCollapse(root.value);
    });

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: (node: unknown) => {
            const el = node instanceof HTMLElement ? node : null;
            if (el) roots.add(el);
            root.value = el;
          },
          style: enabled.value
            ? [{ isolation: 'isolate' }, attrs.style]
            : attrs.style,
        },
        [
          slots.default?.(),
          ...items.value.map(({ key, ...item }) =>
            h(ItemSurface, { key, ...item }),
          ),
        ],
      );
  },
});

type TriggerIconProps = { transition?: Transition };

/** The trigger's icon: the `open` slot while the sidebar is open, the `closed` one otherwise. */
const TriggerIcon = defineComponent({
  name: 'SidebarTriggerIcon',
  inheritAttrs: false,
  props: { transition: Object as PropType<Transition> },
  setup(props, { attrs, slots }) {
    const { state, isMobile, openMobile } = useSidebar();
    return () => {
      const isOpen = isMobile.value
        ? openMobile.value
        : state.value === 'expanded';
      return h(
        IconSwap,
        {
          swapKey: isOpen ? 'open' : 'closed',
          transition: props.transition,
          ...attrs,
        },
        () => (isOpen ? slots.open?.() : slots.closed?.()),
      );
    };
  },
});

export {
  Provider,
  Gap,
  Container,
  Highlight,
  TriggerIcon,
  useSidebar,
  type ProviderProps,
  type GapProps,
  type ContainerProps,
  type HighlightProps,
  type TriggerIconProps,
  type SidebarContextProps,
};
