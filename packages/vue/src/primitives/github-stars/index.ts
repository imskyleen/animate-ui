import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  watchEffect,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import { motion } from 'motion-v';

import { useIsInView } from '../../utils/use-is-in-view';
import { Slot } from '../slot';
import {
  SlidingNumber,
  type SlidingNumberProps,
} from '../texts/sliding-number';
import {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
} from '../effects/particles';

type GithubStarsContextType = {
  stars: () => number;
  currentStars: () => number;
  setCurrentStars: (stars: number) => void;
  isCompleted: () => boolean;
  isLoading: () => boolean;
};

const GithubStarsKey: InjectionKey<GithubStarsContextType> = Symbol(
  'AnimateUIGithubStars',
);

function useGithubStars() {
  const context = inject(GithubStarsKey, null);
  if (!context)
    throw new Error('useGithubStars must be used within GithubStars');
  return context;
}

type GithubStarsProps = {
  username?: string;
  repo?: string;
  value?: number;
  delay?: number;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  asChild?: boolean;
};

const elementOf = (node: unknown) => {
  const element = (node as { $el?: unknown } | null)?.$el ?? node;
  if (element instanceof HTMLElement) return element;
  // A child component rendering a fragment: its element follows the anchor.
  const next = element instanceof Node ? element.nextSibling : null;
  return next instanceof HTMLElement ? next : null;
};

/** Loads a repository's stars from GitHub (or takes `value`) and counts up to them. */
const GithubStars = defineComponent({
  name: 'GithubStars',
  inheritAttrs: false,
  props: {
    username: String,
    repo: String,
    value: { type: Number, default: undefined },
    delay: { type: Number, default: 0 },
    inView: Boolean,
    inViewMargin: { type: String, default: '0px' },
    inViewOnce: { type: Boolean, default: true },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    const { element, isInView } = useIsInView(() => props);
    const stars = ref(props.value ?? 0);
    const currentStars = ref(0);
    const isLoading = ref(true);
    const isCompleted = computed(() => currentStars.value === stars.value);

    watchEffect((onCleanup) => {
      if (props.value !== undefined) {
        stars.value = props.value;
        isLoading.value = false;
        return;
      }
      stars.value = 0;
      isLoading.value = true;
      const { username, repo, delay } = props;
      if (!isInView.value || !username || !repo) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        fetch(`https://api.github.com/repos/${username}/${repo}`, {
          signal: controller.signal,
        })
          .then((response) => {
            if (!response.ok)
              throw new Error(`GitHub API responded ${response.status}`);
            return response.json();
          })
          .then((data) => {
            if (typeof data?.stargazers_count !== 'number')
              throw new Error('GitHub API sent no star count');
            stars.value = data.stargazers_count;
            isLoading.value = false;
          })
          .catch((error) => {
            if (!controller.signal.aborted)
              console.error(
                'Animate UI GithubStars: could not load stars',
                error,
              );
          });
      }, delay);
      onCleanup(() => {
        clearTimeout(timeout);
        controller.abort();
      });
    });

    provide(GithubStarsKey, {
      stars: () => stars.value,
      currentStars: () => currentStars.value,
      setCurrentStars: (value) => (currentStars.value = value),
      isCompleted: () => isCompleted.value,
      isLoading: () => isLoading.value,
    });

    return () => {
      const shared = {
        'aria-busy': isLoading.value || undefined,
        ...attrs,
        ref: (node: unknown) => {
          element.value = elementOf(node);
        },
      };
      return props.asChild
        ? h(
            Slot as Component,
            {
              ...shared,
              style: isLoading.value
                ? [attrs.style, { visibility: 'hidden' }]
                : attrs.style,
            },
            slots,
          )
        : h(motion.div as Component, shared, () =>
            isLoading.value ? null : slots.default?.(),
          );
    };
  },
});

type GithubStarsNumberProps = Omit<SlidingNumberProps, 'number' | 'fromNumber'>;

/** The star count, sliding up from 0. */
const GithubStarsNumber = defineComponent({
  name: 'GithubStarsNumber',
  inheritAttrs: false,
  props: {
    padStart: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const { stars, setCurrentStars } = useGithubStars();
    return () =>
      h(SlidingNumber as Component, {
        number: stars(),
        fromNumber: 0,
        padStart: props.padStart,
        onNumberChange: setCurrentStars,
        ...attrs,
      });
  },
});

type GithubStarsIconProps = {
  icon: Component;
  color?: string;
  activeClass?: string;
};

/** An icon that fills up as the count climbs. */
const GithubStarsIcon = defineComponent({
  name: 'GithubStarsIcon',
  inheritAttrs: false,
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    color: { type: String, default: 'currentColor' },
    activeClass: String,
  },
  setup(props, { attrs }) {
    const { stars, currentStars, isCompleted } = useGithubStars();
    return () => {
      const fillPercentage = stars() > 0 ? (currentStars() / stars()) * 100 : 0;
      const { class: className, style, ...rest } = attrs;
      return h('div', { style: { position: 'relative' } }, [
        h(props.icon, {
          'aria-hidden': 'true',
          ...rest,
          class: className,
          style,
        }),
        h(props.icon, {
          'aria-hidden': 'true',
          ...rest,
          class: [className, props.activeClass],
          style: [
            style,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              fill: props.color,
              stroke: props.color,
              clipPath: `inset(${100 - (isCompleted() ? fillPercentage : fillPercentage - 10)}% 0 0 0)`,
            },
          ],
        }),
      ]);
    };
  },
});

type GithubStarsParticlesProps = ParticlesEffectProps & {
  size?: number;
};

/** Bursts particles around its child once the count is reached. */
const GithubStarsParticles = defineComponent({
  name: 'GithubStarsParticles',
  inheritAttrs: false,
  props: {
    size: { type: Number, default: 4 },
  },
  setup(props, { attrs, slots }) {
    const { isCompleted } = useGithubStars();
    return () =>
      h(Particles as Component, { animate: isCompleted() }, () => [
        slots.default?.(),
        h(ParticlesEffect as Component, {
          ...attrs,
          style: [
            {
              backgroundColor: 'currentcolor',
              borderRadius: '50%',
              width: `${props.size}px`,
              height: `${props.size}px`,
            },
            attrs.style,
          ],
        }),
      ]);
  },
});

/** GitHub's logo. */
const GithubStarsLogo = defineComponent({
  name: 'GithubStarsLogo',
  setup() {
    return () =>
      h(
        'svg',
        {
          role: 'img',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          'aria-label': 'GitHub',
        },
        h('path', {
          d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
        }),
      );
  },
});

export {
  GithubStars,
  GithubStarsNumber,
  GithubStarsIcon,
  GithubStarsParticles,
  GithubStarsLogo,
  useGithubStars,
  type GithubStarsProps,
  type GithubStarsNumberProps,
  type GithubStarsIconProps,
  type GithubStarsParticlesProps,
  type GithubStarsContextType,
};
