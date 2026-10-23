'use client';

import * as React from 'react';
import { useRouter } from '@tanstack/react-router';
import type { TargetAndTransition } from 'motion/react';

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

type Frame = {
  width: number;
  top: number;
  bottom: number;
  x: number;
  y: number;
};

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

function bandFrames(back: boolean, { top, bottom }: Frame) {
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
      const from = top + ((bottom - top) * band) / BANDS;
      const to = top + ((bottom - top) * (band + 1)) / BANDS;
      points.push(
        `${edge}% ${from}px`,
        `${reach}% ${from}px`,
        `${reach}% ${to}px`,
        `${edge}% ${to}px`,
      );
    }
    return `polygon(${points.join(', ')})`;
  });
}

const middle = ({ top, bottom }: Frame) => `50% ${(top + bottom) / 2}px`;

const EFFECTS: Record<
  Effect,
  (back: boolean, enter: Frame, exit: Frame) => EffectAnimation
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
  zoom: (_, enter, exit) => ({
    enter: {
      opacity: [0, 1],
      transform: ['scale(0.94)', 'none'],
      transformOrigin: [middle(enter), middle(enter)],
      transition: { duration: 0.4, ease: ease.out },
    },
    exit: {
      opacity: [1, 0],
      transform: ['none', 'scale(1.04)'],
      transformOrigin: [middle(exit), middle(exit)],
      transition: { duration: 0.2, ease: ease.leave },
    },
  }),
  iris: (_, { width, top, bottom, x, y }) => {
    const radius = Math.hypot(
      Math.max(x, width - x),
      Math.max(y - top, bottom - y),
    );
    return {
      enter: {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
        transition: { duration: 0.6, ease: ease.resize },
      },
      exit: still(0.6),
    };
  },
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
  bands: (back, enter) => ({
    enter: {
      clipPath: bandFrames(back, enter),
      transition: { duration: 0.7, ease: 'linear' },
    },
    exit: still(0.7),
  }),
  stack: (back, enter, exit) => {
    const distance = enter.bottom - enter.top;
    return {
      enter: {
        transform: [`translateY(${back ? -distance : distance}px)`, 'none'],
        transition: { duration: 0.5, ease: ease.resize },
      },
      exit: {
        transform: ['none', 'scale(0.94)'],
        transformOrigin: [middle(exit), middle(exit)],
        opacity: [1, 0.6],
        transition: { duration: 0.5, ease: ease.resize },
      },
    };
  },
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
  chop: (back, { top, bottom }) => ({
    enter: {
      clipPath: back
        ? [
            `polygon(0% ${top}px, -20% ${top}px, 0% ${bottom}px, 0% ${bottom}px)`,
            `polygon(0% ${top}px, 120% ${top}px, 100% ${bottom}px, 0% ${bottom}px)`,
          ]
        : [
            `polygon(100% ${top}px, 100% ${top}px, 100% ${bottom}px, 120% ${bottom}px)`,
            `polygon(-20% ${top}px, 100% ${top}px, 100% ${bottom}px, 0% ${bottom}px)`,
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

const NAME = 'page-transition';

const STYLE =
  ':root[data-page-transition]::view-transition-old(root){display:none}:root[data-page-transition]::view-transition-new(root){animation:none}' +
  `::view-transition-old(${NAME}),::view-transition-new(${NAME}){animation:none;mix-blend-mode:normal;background-color:var(--page-transition-background,canvas)}` +
  `::view-transition-image-pair(${NAME}){overflow:clip;border-radius:var(--page-transition-radius,0)}` +
  '::view-transition-group(*.page-transition-shared){z-index:1;overflow:clip}' +
  '::view-transition-old(*.page-transition-shared),::view-transition-new(*.page-transition-shared){height:100%;object-fit:cover}';

const SHARE = { duration: 0.45, ease: ease.resize };

function sharedRadii() {
  return new Map(
    [
      ...document.querySelectorAll<HTMLElement>(
        '[data-slot="page-transition-shared"]',
      ),
    ].map((element) => {
      const style = getComputedStyle(element);
      return [style.viewTransitionName, style.borderRadius] as const;
    }),
  );
}

function play(
  pseudoElement: string,
  animation: TargetAndTransition,
): Animation {
  const { transition, ...keyframes } = animation;
  const timing = (transition ?? {}) as {
    duration?: number;
    delay?: number;
    ease?: string | readonly number[];
  };
  return document.documentElement.animate(
    keyframes as PropertyIndexedKeyframes,
    {
      pseudoElement,
      duration: (timing.duration ?? 0.3) * 1000,
      delay: (timing.delay ?? 0) * 1000,
      easing: Array.isArray(timing.ease)
        ? `cubic-bezier(${timing.ease.join(',')})`
        : ((timing.ease as string | undefined) ?? 'linear'),
      fill: 'both',
    },
  );
}

function frameOf(element: HTMLElement, point?: { x: number; y: number }) {
  const rect = element.getBoundingClientRect();
  const top = Math.min(Math.max(0, -rect.top), rect.height);
  const bottom = Math.max(top, Math.min(rect.height, innerHeight - rect.top));
  return {
    width: rect.width,
    top,
    bottom,
    x: point ? point.x - rect.left : rect.width / 2,
    y: point ? point.y - rect.top : (top + bottom) / 2,
  };
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
};

function PageTransition({
  effect = 'fade',
  ref,
  children,
  ...props
}: PageTransitionProps) {
  const router = useRouter();
  const reduce = useShouldReduceMotion();
  const localRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  const pointRef = React.useRef<{ x: number; y: number } | undefined>(
    undefined,
  );
  const effectRef = React.useRef<Effect>('fade');

  const refreshStyle = () => {
    if (!localRef.current) return;
    const { style } = document.documentElement;
    style.setProperty('--page-transition-radius', clipRadius(localRef.current));
    style.setProperty(
      '--page-transition-background',
      backgroundOf(localRef.current),
    );
  };

  React.useLayoutEffect(refreshStyle);

  React.useEffect(() => {
    const onInput = (event: Event) => {
      pointRef.current =
        event instanceof PointerEvent
          ? { x: event.clientX, y: event.clientY }
          : undefined;
    };
    document.addEventListener('pointerdown', onInput, true);
    document.addEventListener('keydown', onInput, true);
    return () => {
      document.removeEventListener('pointerdown', onInput, true);
      document.removeEventListener('keydown', onInput, true);
    };
  }, []);

  React.useEffect(
    () =>
      router.subscribe('onBeforeRouteMount', () => {
        const transition = (
          document as Document & {
            activeViewTransition?: ViewTransition | null;
          }
        ).activeViewTransition;
        if (!transition) return;
        // Only a page change hides the old page: other view transitions (a
        // theme switch) keep theirs.
        const root = document.documentElement;
        root.setAttribute('data-page-transition', '');
        transition.finished.finally(() => {
          if (
            (document as Document & { activeViewTransition?: unknown })
              .activeViewTransition !== transition
          )
            root.removeAttribute('data-page-transition');
        });
        const types = (transition as ViewTransition & { types?: Set<string> })
          .types;
        refreshStyle();
        const before = sharedRadii();
        effectRef.current =
          effect === 'random' ? pickEffect(effectRef.current) : effect;
        const named = [...(types ?? [])].find(
          (type): type is Effect => type in EFFECTS,
        );
        const point = pointRef.current;
        const leaving = localRef.current
          ? frameOf(localRef.current, point)
          : undefined;
        transition.ready
          .then(() => {
            const after = localRef.current
              ? frameOf(localRef.current, point)
              : leaving;
            if (!after) return;
            const { enter, exit } = EFFECTS[
              reduce ? 'fade' : (named ?? effectRef.current)
            ](types?.has('nav-back') ?? false, after, leaving ?? after);
            const animations = [
              play(`::view-transition-old(${NAME})`, exit),
              play(`::view-transition-new(${NAME})`, enter),
            ];
            for (const [name, radius] of sharedRadii()) {
              for (const animation of document.getAnimations()) {
                const pseudo = (animation.effect as KeyframeEffect | null)
                  ?.pseudoElement;
                if (pseudo?.endsWith(`(${name})`))
                  animation.effect!.updateTiming({
                    duration: SHARE.duration * 1000,
                    easing: `cubic-bezier(${SHARE.ease.join(',')})`,
                  });
              }
              const from = before.get(name);
              if (from && from !== radius)
                animations.push(
                  play(`::view-transition-group(${name})`, {
                    borderRadius: [from, radius],
                    transition: SHARE,
                  }),
                );
            }
            transition.finished.finally(() =>
              animations.forEach((animation) => animation.cancel()),
            );
          })
          .catch(() => {});
      }),
    [router, effect, reduce],
  );

  return (
    <div
      ref={localRef}
      data-slot="page-transition"
      {...props}
      style={{ viewTransitionName: NAME, ...props.style }}
    >
      <style href="page-transition" precedence="default">
        {STYLE}
      </style>
      {children}
    </div>
  );
}

type PageTransitionSharedProps = React.ComponentProps<'div'> & {
  name: string;
};

function PageTransitionShared({ name, ...props }: PageTransitionSharedProps) {
  return (
    <div
      data-slot="page-transition-shared"
      {...props}
      style={{
        viewTransitionName: name,
        viewTransitionClass: 'page-transition-shared',
        ...props.style,
      }}
    />
  );
}

export {
  PageTransition,
  PageTransitionShared,
  type PageTransitionProps,
  type PageTransitionSharedProps,
  type PageTransitionEffect,
};
