import {
  defineComponent,
  Fragment,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type Component,
  type PropType,
} from 'vue';

import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

type ThemeSelection = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';
type Direction = 'btt' | 'ttb' | 'ltr' | 'rtl';

function getSystemEffective(): Resolved {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getClipKeyframes(direction: Direction): [string, string] {
  switch (direction) {
    case 'rtl':
      return ['inset(0 0 0 100%)', 'inset(0 0 0 0)'];
    case 'ttb':
      return ['inset(0 0 100% 0)', 'inset(0 0 0 0)'];
    case 'btt':
      return ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];
    default:
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
  }
}

type ThemeTogglerProps = {
  theme: ThemeSelection;
  resolvedTheme: Resolved;
  setTheme: (theme: ThemeSelection) => void;
  direction?: Direction;
  onImmediateChange?: (theme: ThemeSelection) => void;
};

const WIPE_DURATION = 700;
const WIPE_EASING = 'ease-in-out';

const PLACEHOLDER_STATE = {
  effective: 'system',
  resolved: 'light',
} as const satisfies { effective: ThemeSelection; resolved: Resolved };

const ThemeTogglerInner = defineComponent({
  name: 'ThemeTogglerInner',
  props: {
    theme: { type: String as PropType<ThemeSelection>, required: true },
    resolvedTheme: { type: String as PropType<Resolved>, required: true },
    setTheme: {
      type: Function as PropType<(theme: ThemeSelection) => void>,
      required: true,
    },
    direction: { type: String as PropType<Direction>, default: 'ltr' },
    onImmediateChange: Function as PropType<(theme: ThemeSelection) => void>,
  },
  setup(props, { slots }) {
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));
    const reduce = useShouldReduceMotion();
    const tokens = useMotionTokens();
    const preview = ref<null | {
      effective: ThemeSelection;
      resolved: Resolved;
    }>(null);
    const current = ref<{ effective: ThemeSelection; resolved: Resolved }>({
      effective: props.theme,
      resolved: props.resolvedTheme,
    });
    watch(
      () => [props.theme, props.resolvedTheme] as const,
      ([theme, resolvedTheme]) => {
        current.value = { effective: theme, resolved: resolvedTheme };
        const shown = preview.value;
        if (
          shown &&
          theme === shown.effective &&
          resolvedTheme === shown.resolved
        )
          preview.value = null;
      },
    );

    const toggleTheme = async (theme: ThemeSelection) => {
      const resolved = theme === 'system' ? getSystemEffective() : theme;
      current.value = { effective: theme, resolved };
      props.onImmediateChange?.(theme);
      if (theme === 'system' && resolved === props.resolvedTheme) {
        props.setTheme(theme);
        return;
      }
      if (reduce.value || !document.startViewTransition) {
        preview.value = { effective: theme, resolved };
        await nextTick();
        props.setTheme(theme);
        return;
      }
      const [fromClip, toClip] = getClipKeyframes(props.direction);
      await document.startViewTransition(async () => {
        preview.value = { effective: theme, resolved };
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        await nextTick();
      }).ready;
      document.documentElement
        .animate(
          { clipPath: [fromClip, toClip] },
          {
            duration: WIPE_DURATION * tokens.value.tempo,
            easing: WIPE_EASING,
            pseudoElement: '::view-transition-new(root)',
          },
        )
        .finished.finally(() => props.setTheme(theme));
    };

    return () => {
      const state = mounted.value ? current.value : PLACEHOLDER_STATE;
      return h(Fragment, [
        slots.default?.({
          effective: state.effective,
          resolved: state.resolved,
          toggleTheme,
        }),
        h(
          'style',
          null,
          '::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}',
        ),
      ]);
    };
  },
});

/** Switches the theme with a wipe across the page (a View Transition). */
const ThemeToggler = defineComponent({
  name: 'ThemeToggler',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(ThemeTogglerInner as Component, attrs, slots),
      );
  },
});

export {
  ThemeToggler,
  type ThemeTogglerProps,
  type ThemeSelection,
  type Resolved,
  type Direction,
};
