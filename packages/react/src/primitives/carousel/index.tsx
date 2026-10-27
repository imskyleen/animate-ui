'use client';

import * as React from 'react';
import useEmbla, { type EmblaViewportRefType } from 'embla-carousel-react';
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from 'embla-carousel';

import { mergeRefs } from '../../internal/anchored';
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

type UseEmblaCarouselType = [
  EmblaViewportRefType,
  EmblaCarouselType | undefined,
];

/**
 * Embla's `useEmblaCarousel`, animated: `scale` shrinks the slides away from
 * the center, `visible` sizes them so that many show.
 */
function useEmblaCarousel(
  options?: CarouselOptions,
  plugins?: EmblaPluginType[],
): UseEmblaCarouselType {
  const { scale, visible, ...emblaOptions } = options ?? {};
  const [emblaRef, api] = useEmbla(emblaOptions, plugins);
  const axis = emblaOptions.axis === 'y' ? 'y' : 'x';
  const reduce = useShouldReduceMotion();
  const [viewport, setViewport] = React.useState<HTMLElement | null>(null);
  const shrink = scale !== undefined && scale < 1 ? Math.max(scale, 0) : null;

  // Sized as the viewport attaches, before it paints.
  const ref = React.useCallback<EmblaViewportRefType>(
    (node) => {
      emblaRef(node);
      setViewport(node);
      if (node && visible) sizeSlides(node, axis, visible, shrink ?? 1);
    },
    [emblaRef, visible, shrink, axis],
  );

  React.useLayoutEffect(() => {
    if (!viewport || !visible) return;
    const size = () => sizeSlides(viewport, axis, visible, shrink ?? 1);
    size();
    const observer = new ResizeObserver(size);
    observer.observe(viewport);
    api?.on('slidesChanged', size);
    return () => {
      observer.disconnect();
      api?.off('slidesChanged', size);
      unsizeSlides(viewport);
    };
  }, [viewport, visible, shrink, axis, api]);

  // The dots and counter read the carousel from inside it.
  React.useEffect(() => {
    const root = rootOf(api?.rootNode());
    if (!api || !root) return;
    publish(root, api);
    return () => publish(root, undefined);
  }, [api]);

  // The arrows sit along the slides, whatever comes under them.
  React.useEffect(() => {
    const view = api?.rootNode();
    const root = rootOf(view);
    if (!view || !root) return;
    const align = () => alignArrows(root, view, axis);
    align();
    const observer = new ResizeObserver(align);
    observer.observe(root);
    observer.observe(view);
    return () => {
      observer.disconnect();
      unalignArrows(root);
    };
  }, [api, axis]);

  // The slides follow the scroll, frame by frame, while dragged or snapping.
  React.useEffect(() => {
    if (!api || reduce || shrink === null) return;
    const side = sideOf(visible);
    let measures = measureSlides(api, axis);
    const update = () => {
      const slides = api.slideNodes();
      const loop = api.internalEngine().options.loop ? slides.length : 0;
      // Every read first, then every write.
      slideDistances(api, axis, measures.center).forEach((distance, index) => {
        const slide = slides[index];
        const measure = measures.slides[index];
        if (!slide || !measure) return;
        applyScale(
          slide,
          distance,
          shrink,
          side,
          axis,
          loop,
          measure.step,
          measure.gap,
        );
      });
    };
    const remeasure = () => {
      measures = measureSlides(api, axis);
      update();
    };
    update();
    api
      .on('scroll', update)
      .on('settle', update)
      .on('reInit', remeasure)
      .on('resize', remeasure)
      .on('slideFocus', update);
    return () => {
      api
        .off('scroll', update)
        .off('settle', update)
        .off('reInit', remeasure)
        .off('resize', remeasure)
        .off('slideFocus', update);
      clearScale(api);
    };
  }, [api, reduce, shrink, visible, axis]);

  return [ref, api];
}

Object.defineProperty(useEmblaCarousel, 'globalOptions', {
  get: () => useEmbla.globalOptions,
  set: (value: EmblaOptionsType | undefined) => {
    useEmbla.globalOptions = value;
  },
});

// The carousel around a node, once it has started.
function useCarouselFrom(node: HTMLElement | null) {
  const [api, setApi] = React.useState<EmblaCarouselType>();
  React.useEffect(() => {
    const root = rootOf(node);
    if (!root) return;
    return subscribe(root, setApi);
  }, [node]);
  return api;
}

// The selected slide's place among the snaps, and how many there are.
function useSelected(api: EmblaCarouselType | undefined) {
  const [state, setState] = React.useState({ index: 0, count: 0 });

  React.useEffect(() => {
    if (!api) return;
    const update = () =>
      setState({
        index: api.selectedScrollSnap(),
        count: api.scrollSnapList().length,
      });
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  return state;
}

type CarouselDotsProps = React.ComponentProps<'div'>;

/**
 * One dot per slide, inside the carousel. The current one is a pill that
 * follows the scroll, stretching from dot to dot as it goes.
 */
function CarouselDots({ ref, ...props }: CarouselDotsProps) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setNode), [ref]);
  const api = useCarouselFrom(node);
  const { index, count } = useSelected(api);
  const pillRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      const el = pillRef.current;
      const first = node?.querySelector<HTMLElement>(
        '[data-slot="carousel-dot"]',
      );
      const second = first?.nextElementSibling as HTMLElement | null;
      if (!el || !first || api.scrollSnapList().length < 1) return;
      const step = second ? second.offsetLeft - first.offsetLeft : 0;
      const { start, end } = pillSpan(api);
      el.style.translate = `${first.offsetLeft + start * step}px -50%`;
      el.style.width = `${(end - start) * step + first.offsetWidth}px`;
    };
    update();
    api.on('scroll', update).on('reInit', update).on('select', update);
    return () => {
      api.off('scroll', update).off('reInit', update).off('select', update);
    };
  }, [api, count, node]);

  return (
    <>
      <style href="animate-ui-carousel" precedence="animate-ui">
        {DOTS_CSS}
      </style>
      <div ref={mergedRef} data-slot="carousel-dots" {...props}>
        {Array.from({ length: count }, (_, dot) => (
          <button
            key={dot}
            type="button"
            data-slot="carousel-dot"
            aria-label={`Go to slide ${dot + 1}`}
            aria-current={dot === index || undefined}
            onClick={() => api?.scrollTo(dot)}
          />
        ))}
        <span ref={pillRef} aria-hidden data-slot="carousel-dots-indicator" />
      </div>
    </>
  );
}

type CarouselCounterProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The text, from the sliding number and the count. */
  format?: (current: React.ReactNode, count: number) => React.ReactNode;
};

/** "Slide 2 of 5", inside the carousel, the number sliding to the next one. */
function CarouselCounter({
  ref,
  format = (current, count) => (
    <>
      Slide {current} of {count}
    </>
  ),
  ...props
}: CarouselCounterProps) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(ref, setNode), [ref]);
  const { index, count } = useSelected(useCarouselFrom(node));

  return (
    <>
      <style href="animate-ui-carousel" precedence="animate-ui">
        {DOTS_CSS}
      </style>
      <div
        ref={mergedRef}
        data-slot="carousel-counter"
        aria-live="polite"
        {...props}
      >
        {format(
          <SlidingNumber
            number={index + 1}
            style={{ display: 'inline-flex' }}
          />,
          count,
        )}
      </div>
    </>
  );
}

export default useEmblaCarousel;
export {
  CarouselDots,
  CarouselCounter,
  type CarouselOptions,
  type CarouselDotsProps,
  type CarouselCounterProps,
  type EmblaViewportRefType,
  type UseEmblaCarouselType,
};
