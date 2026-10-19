'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import type { TargetAndTransition } from 'motion/react';
import { AnimateView } from 'motion/react-animate-view';

import {
  blur,
  ease,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';

type PageTransitionEffect =
  | 'fade'
  | 'slide'
  | 'push'
  | 'zoom'
  | 'iris'
  | 'wipe'
  | 'bands'
  | 'stack'
  | 'flow'
  | 'chop'
  | 'random';

type Effect = Exclude<PageTransitionEffect, 'random'>;

type Origin = { x: number; y: number };

type EffectAnimation = {
  enter: TargetAndTransition;
  exit: TargetAndTransition;
};

const SLIDE = 60;
const BANDS = 5;
const BAND_STAGGER = 0.12;
const BAND_FRAMES = 16;

const still = (duration: number): TargetAndTransition => ({
  transform: ['none', 'none'],
  transition: { duration },
});

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function bandFrames(back: boolean) {
  const span = 1 - (BANDS - 1) * BAND_STAGGER;
  return Array.from({ length: BAND_FRAMES + 1 }, (_, frame) => {
    const t = frame / BAND_FRAMES;
    const points: string[] = [];
    for (let band = 0; band < BANDS; band++) {
      const progress = easeOutCubic(
        Math.min(1, Math.max(0, (t - band * BAND_STAGGER) / span)),
      );
      const edge = back ? 100 : 0;
      const reach = back ? 100 - progress * 100 : progress * 100;
      const top = (band / BANDS) * 100;
      const bottom = ((band + 1) / BANDS) * 100;
      points.push(
        `${edge}% ${top}%`,
        `${reach}% ${top}%`,
        `${reach}% ${bottom}%`,
        `${edge}% ${bottom}%`,
      );
    }
    return `polygon(${points.join(', ')})`;
  });
}

const CLIP =
  '::view-transition-image-pair(*.page-transition){overflow:clip}' +
  '::view-transition-group(*.page-transition-shared){z-index:1;overflow:clip}' +
  '::view-transition-old(*.page-transition-shared),::view-transition-new(*.page-transition-shared){height:100%;object-fit:cover}';

const SHARE = { duration: 0.45, ease: ease.resize };

const radii = new Map<string, string>();

function morphRadius(name: string, from: string | undefined, to: string) {
  if (!from || from === to) return;
  const animation = document.documentElement.animate(
    { borderRadius: [from, to] },
    {
      pseudoElement: `::view-transition-group(${name})`,
      duration: SHARE.duration * 1000,
      easing: `cubic-bezier(${SHARE.ease.join(',')})`,
      fill: 'both',
    },
  );
  const transition = (
    document as Document & { activeViewTransition?: ViewTransition | null }
  ).activeViewTransition;
  transition?.finished.finally(() => animation.cancel());
}

const EFFECTS: Record<
  Effect,
  (back: boolean, origin: Origin) => EffectAnimation
> = {
  fade: () => ({
    enter: {
      opacity: [0, 1],
      filter: [blur.panel, 'blur(0px)'],
      transition: { duration: 0.3, ease: ease.out },
    },
    exit: {
      opacity: [1, 0],
      filter: ['blur(0px)', blur.panel],
      transition: { duration: 0.15, ease: ease.leave },
    },
  }),
  slide: (back) => {
    const from = back ? -SLIDE : SLIDE;
    return {
      enter: {
        opacity: [0, 1],
        transform: [`translateX(${from}px)`, 'none'],
        transition: { duration: 0.4, ease: ease.out },
      },
      exit: {
        opacity: [1, 0],
        transform: ['none', `translateX(${-from}px)`],
        transition: { duration: 0.2, ease: ease.leave },
      },
    };
  },
  push: (back) => {
    const from = back ? -100 : 100;
    return {
      enter: {
        transform: [`translateX(${from}%)`, 'none'],
        transition: { duration: 0.5, ease: ease.inOut },
      },
      exit: {
        transform: ['none', `translateX(${-from}%)`],
        transition: { duration: 0.5, ease: ease.inOut },
      },
    };
  },
  zoom: () => ({
    enter: {
      opacity: [0, 1],
      transform: ['scale(0.94)', 'none'],
      transition: { duration: 0.4, ease: ease.out },
    },
    exit: {
      opacity: [1, 0],
      transform: ['none', 'scale(1.04)'],
      transition: { duration: 0.2, ease: ease.leave },
    },
  }),
  iris: (_, { x, y }) => ({
    enter: {
      clipPath: [`circle(0% at ${x}% ${y}%)`, `circle(150% at ${x}% ${y}%)`],
      transition: { duration: 0.6, ease: ease.resize },
    },
    exit: still(0.6),
  }),
  wipe: (back) => ({
    enter: {
      clipPath: [back ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', 'inset(0)'],
      transition: { duration: 0.5, ease: ease.resize },
    },
    exit: {
      transform: ['none', `translateX(${back ? 8 : -8}%)`],
      transition: { duration: 0.5, ease: ease.resize },
    },
  }),
  bands: (back) => ({
    enter: {
      clipPath: bandFrames(back),
      transition: { duration: 0.7, ease: 'linear' },
    },
    exit: still(0.7),
  }),
  stack: (back) => ({
    enter: {
      transform: [`translateY(${back ? -100 : 100}%)`, 'none'],
      transition: { duration: 0.5, ease: ease.resize },
    },
    exit: {
      transform: ['none', 'scale(0.94)'],
      opacity: [1, 0.6],
      transition: { duration: 0.5, ease: ease.resize },
    },
  }),
  flow: (back) => {
    const from = back ? -30 : 30;
    return {
      enter: {
        opacity: [0, 1],
        transform: [`translateX(${from}%)`, 'none'],
        filter: ['blur(12px)', 'blur(0px)'],
        transition: { duration: 0.35, ease: ease.out },
      },
      exit: {
        opacity: [1, 0],
        transform: ['none', `translateX(${-from}%)`],
        filter: ['blur(0px)', 'blur(12px)'],
        transition: { duration: 0.25, ease: ease.leave },
      },
    };
  },
  chop: (back) => ({
    enter: {
      clipPath: back
        ? [
            'polygon(0% 0%, -20% 0%, 0% 100%, 0% 100%)',
            'polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)',
          ]
        : [
            'polygon(100% 0%, 100% 0%, 100% 100%, 120% 100%)',
            'polygon(-20% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ],
      transition: { duration: 0.55, ease: ease.inOut },
    },
    exit: {
      transform: ['none', `translateX(${back ? 6 : -6}%)`],
      transition: { duration: 0.55, ease: ease.inOut },
    },
  }),
};

function pickEffect(previous?: Effect): Effect {
  const choices = (Object.keys(EFFECTS) as Effect[]).filter(
    (name) => name !== previous,
  );
  return choices[Math.floor(Math.random() * choices.length)]!;
}

function backgroundOf(element: HTMLElement) {
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(color))
      return color;
  }
  return 'canvas';
}

function clipRadius(element: HTMLElement) {
  const own = getComputedStyle(element).borderRadius;
  if (own !== '0px') return own;
  let parent = element.parentElement;
  while (parent && getComputedStyle(parent).overflow === 'visible')
    parent = parent.parentElement;
  if (!parent) return '0px';
  const style = getComputedStyle(parent);
  const outer = parent.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const top = parseFloat(style.borderTopWidth);
  const right = parseFloat(style.borderRightWidth);
  const bottom = parseFloat(style.borderBottomWidth);
  const left = parseFloat(style.borderLeftWidth);
  const touches = {
    top: rect.top - (outer.top + top) < 1,
    right: outer.right - right - rect.right < 1,
    bottom: outer.bottom - bottom - rect.bottom < 1,
    left: rect.left - (outer.left + left) < 1,
  };
  const corner = (radius: string, a: boolean, b: boolean, border: number) =>
    a && b ? `${Math.max(0, parseFloat(radius) - border)}px` : '0px';
  return [
    corner(
      style.borderTopLeftRadius,
      touches.top,
      touches.left,
      Math.max(top, left),
    ),
    corner(
      style.borderTopRightRadius,
      touches.top,
      touches.right,
      Math.max(top, right),
    ),
    corner(
      style.borderBottomRightRadius,
      touches.bottom,
      touches.right,
      Math.max(bottom, right),
    ),
    corner(
      style.borderBottomLeftRadius,
      touches.bottom,
      touches.left,
      Math.max(bottom, left),
    ),
  ].join(' ');
}

type PageTransitionProps = React.ComponentProps<'div'> & {
  effect?: PageTransitionEffect;
  pageKey?: React.Key;
};

function PageTransition({
  effect = 'fade',
  pageKey,
  ref,
  children,
  ...props
}: PageTransitionProps) {
  const pathname = usePathname();
  const key = pageKey ?? pathname;
  const reduce = useShouldReduceMotion();
  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const originRef = React.useRef<Origin>({ x: 50, y: 50 });
  const effectRef = React.useRef<Effect>('fade');
  const id = React.useId();
  const className = `page-transition-${id.replace(/[^a-z0-9]/gi, '')}`;

  React.useLayoutEffect(() => {
    effectRef.current =
      effect === 'random' ? pickEffect(effectRef.current) : effect;
  }, [effect, key]);

  const refreshStyle = () => {
    if (!localRef.current || !styleRef.current) return;
    styleRef.current.textContent =
      `::view-transition-image-pair(*.${className}){border-radius:${clipRadius(localRef.current)}}` +
      `::view-transition-old(*.${className}),::view-transition-new(*.${className}){background-color:${backgroundOf(localRef.current)}}`;
  };

  React.useLayoutEffect(refreshStyle);

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const rect = localRef.current?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      originRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  const animation = (types: string[]) => {
    refreshStyle();
    const named = types.find((type): type is Effect => type in EFFECTS);
    return EFFECTS[reduce ? 'fade' : (named ?? effectRef.current)](
      types.includes('nav-back'),
      originRef.current,
    );
  };

  return (
    <AnimateView
      key={key}
      enter={(types) => animation(types).enter}
      exit={(types) => animation(types).exit}
    >
      <div
        ref={localRef}
        data-slot="page-transition"
        {...props}
        style={{
          viewTransitionClass: `page-transition ${className}`,
          ...props.style,
        }}
      >
        <style href="page-transition" precedence="default">
          {CLIP}
        </style>
        <style ref={styleRef} />
        {children}
      </div>
    </AnimateView>
  );
}

type PageTransitionSharedProps = React.ComponentProps<'div'> & {
  name: string;
};

function PageTransitionShared({
  name,
  ref,
  ...props
}: PageTransitionSharedProps) {
  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  const fromRef = React.useRef<string | undefined>(undefined);

  React.useLayoutEffect(() => {
    if (!localRef.current) return;
    fromRef.current = radii.get(name);
    radii.set(name, getComputedStyle(localRef.current).borderRadius);
  });

  return (
    <AnimateView
      name={name}
      transition={SHARE}
      onAnimationStart={(_, type) => {
        if (type === 'share' && localRef.current)
          morphRadius(
            name,
            fromRef.current,
            getComputedStyle(localRef.current).borderRadius,
          );
      }}
    >
      <div
        ref={localRef}
        data-slot="page-transition-shared"
        {...props}
        style={{
          viewTransitionClass: 'page-transition-shared',
          ...props.style,
        }}
      />
    </AnimateView>
  );
}

export {
  PageTransition,
  PageTransitionShared,
  type PageTransitionProps,
  type PageTransitionSharedProps,
  type PageTransitionEffect,
};
