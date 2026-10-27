import {
  computed,
  defineComponent,
  h,
  isRef,
  onMounted,
  ref,
  shallowRef,
  unref,
  watch,
  type MaybeRef,
} from 'vue';
import emblaCarouselVueBase, {
  type EmblaCarouselVueType,
} from 'embla-carousel-vue';
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from 'embla-carousel';

import { useShouldReduceMotion } from '../../utils/motion';
import { SlidingNumber } from '../texts/sliding-number';
import {
  DOTS_CSS,
  alignArrows,
  applyScale,
  clearScale,
  measureSlides,
  pillSpan,
  publish,
  rootOf,
  sideOf,
  sizeSlides,
  slideDistances,
  subscribe,
  unalignArrows,
  unsizeSlides,
} from './effects';

type CarouselOptions = EmblaOptionsType & {
  /** The neighbours' scale, from 0 to 1: slides shrink away from the center. */
  scale?: number;
  /** How many slides show, the selected one in the middle: sizes the slides. */
  visible?: number;
};

/**
 * Embla's `emblaCarouselVue`, animated: `scale` shrinks the slides away from
 * the center, `visible` sizes them so that many show.
 */
function emblaCarouselVue(
  options?: MaybeRef<CarouselOptions | undefined>,
  plugins?: MaybeRef<EmblaPluginType[]>,
): EmblaCarouselVueType {
  const all = computed(() => unref(options) ?? {});
  const emblaOptions = computed(() => {
    const { scale: _scale, visible: _visible, ...rest } = all.value;
    return rest;
  });
  const [viewport, api] = emblaCarouselVueBase(
    isRef(options) ? emblaOptions : emblaOptions.value,
    plugins,
  );
  const axis = computed(() => (emblaOptions.value.axis === 'y' ? 'y' : 'x'));
  const shrink = computed(() => {
    const scale = all.value.scale;
    return scale !== undefined && scale < 1 ? Math.max(scale, 0) : null;
  });
  const visible = computed(() => all.value.visible);
  const reduce = useShouldReduceMotion();

  // Sized as soon as the viewport is there, before it paints.
  watch(
    [viewport, visible, shrink, axis, api],
    ([node, shown, scale, direction, carousel], _, onCleanup) => {
      if (!node || !shown) return;
      const size = () => sizeSlides(node, direction, shown, scale ?? 1);
      size();
      const observer = new ResizeObserver(size);
      observer.observe(node);
      carousel?.on('slidesChanged', size);
      onCleanup(() => {
        observer.disconnect();
        carousel?.off('slidesChanged', size);
        unsizeSlides(node);
      });
    },
    { immediate: true, flush: 'post' },
  );

  // The dots and counter read the carousel from inside it.
  watch(
    api,
    (carousel, _, onCleanup) => {
      const root = rootOf(carousel?.rootNode());
      if (!carousel || !root) return;
      publish(root, carousel);
      onCleanup(() => publish(root, undefined));
    },
    { immediate: true },
  );

  // The arrows sit along the slides, whatever comes under them.
  watch(
    [api, axis],
    ([carousel, direction], _, onCleanup) => {
      const view = carousel?.rootNode();
      const root = rootOf(view);
      if (!view || !root) return;
      const align = () => alignArrows(root, view, direction);
      align();
      const observer = new ResizeObserver(align);
      observer.observe(root);
      observer.observe(view);
      onCleanup(() => {
        observer.disconnect();
        unalignArrows(root);
      });
    },
    { immediate: true, flush: 'post' },
  );

  // The slides follow the scroll, frame by frame, while dragged or snapping.
  watch(
    [api, reduce, shrink, visible, axis],
    ([carousel, reduced, scale, shown, direction], _, onCleanup) => {
      if (!carousel || reduced || scale === null) return;
      const side = sideOf(shown);
      let measures = measureSlides(carousel, direction);
      const update = () => {
        const slides = carousel.slideNodes();
        const loop = carousel.internalEngine().options.loop ? slides.length : 0;
        // Every read first, then every write.
        slideDistances(carousel, direction, measures.center).forEach(
          (distance, index) => {
            const slide = slides[index];
            const measure = measures.slides[index];
            if (!slide || !measure) return;
            applyScale(
              slide,
              distance,
              scale,
              side,
              direction,
              loop,
              measure.step,
              measure.gap,
            );
          },
        );
      };
      const remeasure = () => {
        measures = measureSlides(carousel, direction);
        update();
      };
      update();
      carousel
        .on('scroll', update)
        .on('settle', update)
        .on('reInit', remeasure)
        .on('resize', remeasure)
        .on('slideFocus', update);
      onCleanup(() => {
        carousel
          .off('scroll', update)
          .off('settle', update)
          .off('reInit', remeasure)
          .off('resize', remeasure)
          .off('slideFocus', update);
        clearScale(carousel);
      });
    },
    { immediate: true, flush: 'post' },
  );

  return [viewport, api];
}

Object.defineProperty(emblaCarouselVue, 'globalOptions', {
  get: () => emblaCarouselVueBase.globalOptions,
  set: (value: EmblaOptionsType | undefined) => {
    emblaCarouselVueBase.globalOptions = value;
  },
});

function addStyle() {
  if (
    typeof document === 'undefined' ||
    document.getElementById('animate-ui-carousel')
  )
    return;
  const style = document.createElement('style');
  style.id = 'animate-ui-carousel';
  style.textContent = DOTS_CSS;
  document.head.append(style);
}

// The carousel around a node, once it has started, and its selected slide.
function useCarouselFrom() {
  const node = ref<HTMLElement | null>(null);
  const api = shallowRef<EmblaCarouselType>();
  const index = ref(0);
  const count = ref(0);
  watch(
    node,
    (element, _, onCleanup) => {
      const root = rootOf(element);
      if (root)
        onCleanup(
          subscribe(root, (carousel) => {
            api.value = carousel;
          }),
        );
    },
    { flush: 'post' },
  );
  watch(api, (carousel, _, onCleanup) => {
    if (!carousel) return;
    const update = () => {
      index.value = carousel.selectedScrollSnap();
      count.value = carousel.scrollSnapList().length;
    };
    update();
    carousel.on('select', update).on('reInit', update);
    onCleanup(() => {
      carousel.off('select', update).off('reInit', update);
    });
  });
  onMounted(addStyle);
  return { node, api, index, count };
}

/**
 * One dot per slide, inside the carousel. The current one is a pill that
 * follows the scroll, stretching from dot to dot as it goes.
 */
const CarouselDots = defineComponent({
  name: 'CarouselDots',
  setup() {
    const { node, api, index, count } = useCarouselFrom();
    const pill = ref<HTMLElement | null>(null);

    watch(
      [api, count, node],
      ([carousel, , element], _, onCleanup) => {
        if (!carousel) return;
        const update = () => {
          const el = pill.value;
          const first = element?.querySelector<HTMLElement>(
            '[data-slot="carousel-dot"]',
          );
          const second = first?.nextElementSibling as HTMLElement | null;
          if (!el || !first || carousel.scrollSnapList().length < 1) return;
          const step = second ? second.offsetLeft - first.offsetLeft : 0;
          const { start, end } = pillSpan(carousel);
          el.style.translate = `${first.offsetLeft + start * step}px -50%`;
          el.style.width = `${(end - start) * step + first.offsetWidth}px`;
        };
        update();
        carousel.on('scroll', update).on('reInit', update).on('select', update);
        onCleanup(() => {
          carousel
            .off('scroll', update)
            .off('reInit', update)
            .off('select', update);
        });
      },
      { flush: 'post' },
    );

    return () =>
      h('div', { ref: node, 'data-slot': 'carousel-dots' }, [
        ...Array.from({ length: count.value }, (_, dot) =>
          h('button', {
            key: dot,
            type: 'button',
            'data-slot': 'carousel-dot',
            'aria-label': `Go to slide ${dot + 1}`,
            'aria-current': dot === index.value || undefined,
            onClick: () => api.value?.scrollTo(dot),
          }),
        ),
        h('span', {
          ref: pill,
          'aria-hidden': 'true',
          'data-slot': 'carousel-dots-indicator',
        }),
      ]);
  },
});

/**
 * "Slide 2 of 5", inside the carousel, the number sliding to the next one.
 * Its slot takes the sliding number and the count.
 */
const CarouselCounter = defineComponent({
  name: 'CarouselCounter',
  setup(_, { slots }) {
    const { node, index, count } = useCarouselFrom();

    return () => {
      const current = h(SlidingNumber, {
        number: index.value + 1,
        style: { display: 'inline-flex' },
      });
      return h(
        'div',
        { ref: node, 'data-slot': 'carousel-counter', 'aria-live': 'polite' },
        slots.default
          ? slots.default({ current, count: count.value })
          : ['Slide ', current, ` of ${count.value}`],
      );
    };
  },
});

export default emblaCarouselVue;
export {
  CarouselDots,
  CarouselCounter,
  type CarouselOptions,
  type EmblaCarouselVueType,
};
