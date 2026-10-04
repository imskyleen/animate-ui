'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Variant } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

type Slide = {
  direction?: SlideDirection;
  offset?: number;
};

type Fade = { initialOpacity?: number; opacity?: number };

type Zoom = {
  initialScale?: number;
  scale?: number;
};

type Blur = {
  initialBlur?: number;
  blur?: number;
};

type EffectProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    blur?: Blur | boolean;
    slide?: Slide | boolean;
    fade?: Fade | boolean;
    zoom?: Zoom | boolean;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

const DEFAULT_SLIDE_DIRECTION: SlideDirection = 'up';
const DEFAULT_SLIDE_OFFSET: number = 100;
const DEFAULT_FADE_INITIAL_OPACITY: number = 0;
const DEFAULT_FADE_OPACITY: number = 1;
const DEFAULT_ZOOM_INITIAL_SCALE: number = 0.5;
const DEFAULT_ZOOM_SCALE: number = 1;
const DEFAULT_BLUR_INITIAL_BLUR: number = 10;
const DEFAULT_BLUR_BLUR: number = 0;

function Effect({
  ref,
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  blur = false,
  slide = false,
  fade = false,
  zoom = false,
  asChild = false,
  ...props
}: EffectProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  const hiddenVariant: Variant = {};
  const visibleVariant: Variant = {};

  if (slide) {
    const offset =
      typeof slide === 'boolean'
        ? DEFAULT_SLIDE_OFFSET
        : (slide.offset ?? DEFAULT_SLIDE_OFFSET);
    const direction =
      typeof slide === 'boolean'
        ? DEFAULT_SLIDE_DIRECTION
        : (slide.direction ?? DEFAULT_SLIDE_DIRECTION);
    const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
    hiddenVariant[axis] =
      direction === 'right' || direction === 'down' ? -offset : offset;
    visibleVariant[axis] = 0;
  }

  if (fade) {
    hiddenVariant.opacity =
      typeof fade === 'boolean'
        ? DEFAULT_FADE_INITIAL_OPACITY
        : (fade.initialOpacity ?? DEFAULT_FADE_INITIAL_OPACITY);
    visibleVariant.opacity =
      typeof fade === 'boolean'
        ? DEFAULT_FADE_OPACITY
        : (fade.opacity ?? DEFAULT_FADE_OPACITY);
  }

  if (zoom) {
    hiddenVariant.scale =
      typeof zoom === 'boolean'
        ? DEFAULT_ZOOM_INITIAL_SCALE
        : (zoom.initialScale ?? DEFAULT_ZOOM_INITIAL_SCALE);
    visibleVariant.scale =
      typeof zoom === 'boolean'
        ? DEFAULT_ZOOM_SCALE
        : (zoom.scale ?? DEFAULT_ZOOM_SCALE);
  }

  if (blur) {
    hiddenVariant.filter =
      typeof blur === 'boolean'
        ? `blur(${DEFAULT_BLUR_INITIAL_BLUR}px)`
        : `blur(${blur.initialBlur ?? DEFAULT_BLUR_INITIAL_BLUR}px)`;
    visibleVariant.filter =
      typeof blur === 'boolean'
        ? `blur(${DEFAULT_BLUR_BLUR}px)`
        : `blur(${blur.blur ?? DEFAULT_BLUR_BLUR}px)`;
  }

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={{
        hidden: hiddenVariant,
        visible: visibleVariant,
      }}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
      }}
      {...props}
    />
  );
}

type EffectsProps = Omit<EffectProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Effects({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: EffectsProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Effect
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Effect>
      ))}
    </>
  );
}

export {
  Effect,
  Effects,
  type EffectProps,
  type EffectsProps,
  type SlideDirection,
  type Slide,
  type Fade,
  type Zoom,
};
