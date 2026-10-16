'use client';

import { ease, useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from 'react';

import { AnimateUILogo } from '@/lib/libraries';

import { AutoplayScope, VIGNETTES } from './vignettes';

const STAGE = { width: 1200, height: 780 };
const CARD = { width: 300, height: 176 };
const GAP = 16;
const COLUMNS = 3;
const RADIUS = { x: 470, y: 250 };
const COUNT = VIGNETTES.length;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const round = (value: number, digits: number) =>
  Math.round(value * 10 ** digits) / 10 ** digits;

function subscribeToWide(callback: () => void) {
  const query = window.matchMedia('(min-width: 768px)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function useWide() {
  return useSyncExternalStore(
    subscribeToWide,
    () => window.matchMedia('(min-width: 768px)').matches,
    () => true,
  );
}

function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () =>
      setScale(
        Math.min(
          1,
          window.innerWidth / STAGE.width,
          window.innerHeight / STAGE.height,
        ),
      );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}

function Card({ title, Vignette }: { title: string; Vignette: ComponentType }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-slot="orbit-card"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative flex size-full flex-col rounded-2xl border bg-background dark:bg-neutral-900 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.35)] dark:shadow-[0_24px_60px_-28px_rgb(0_0_0/0.9)]"
    >
      <span className="absolute top-3 left-4 text-xs font-medium text-muted-foreground">
        {title}
      </span>
      <div className="flex flex-1 items-center justify-center p-5 pt-8">
        <AutoplayScope paused={hovered}>
          <Vignette />
        </AutoplayScope>
      </div>
    </div>
  );
}

function OrbitCard({
  index,
  enter,
  settle,
  turn,
  drift,
}: {
  index: number;
  enter: MotionValue<number>;
  settle: MotionValue<number>;
  turn: MotionValue<number>;
  drift: MotionValue<number>;
}) {
  const { title, Vignette } = VIGNETTES[index]!;
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const rows = Math.ceil(COUNT / COLUMNS);
  const slot = {
    x: (column - (COLUMNS - 1) / 2) * (CARD.width + GAP),
    y: (row - (rows - 1) / 2) * (CARD.height + GAP) + 40,
  };

  const place = useTransform(
    [enter, settle, turn, drift] as MotionValue<number>[],
    ([e, s, t, d]: number[]) => {
      const angle = (index / COUNT) * Math.PI * 2 + t! + d! * (1 - s!);
      const depth = (Math.sin(angle) + 1) / 2;
      const reach = 1 + (1 - e!) * 1.4;
      const orbit = {
        x: Math.cos(angle) * RADIUS.x * reach,
        y: Math.sin(angle) * RADIUS.y * reach + 30,
        scale: 0.7 + 0.3 * depth,
        blur: (1 - depth) * 1.6 + (1 - e!) * 10,
        opacity: (0.55 + 0.45 * depth) * e!,
        rotateY: -Math.cos(angle) * 24,
      };
      const k = smooth(s!);
      return {
        x: orbit.x + (slot.x - orbit.x) * k,
        y: orbit.y + (slot.y - orbit.y) * k,
        scale: orbit.scale + (1 - orbit.scale) * k,
        blur: orbit.blur * (1 - k),
        opacity: orbit.opacity + (1 - orbit.opacity) * k,
        rotateY: orbit.rotateY * (1 - k),
        z: k > 0.5 ? 30 : depth > 0.5 ? 20 : 5,
      };
    },
  );

  const x = useTransform(place, (p) => round(p.x, 1));
  const y = useTransform(place, (p) => round(p.y, 1));
  const scale = useTransform(place, (p) => round(p.scale, 3));
  const opacity = useTransform(place, (p) => round(p.opacity, 3));
  const rotateY = useTransform(place, (p) => round(p.rotateY, 2));
  const filter = useTransform(place, (p) =>
    p.blur > 0.05 ? `blur(${round(p.blur, 1)}px)` : 'none',
  );
  const zIndex = useTransform(place, (p) => p.z);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: CARD.width,
        height: CARD.height,
        marginLeft: -CARD.width / 2,
        marginTop: -CARD.height / 2,
        x,
        y,
        scale,
        opacity,
        rotateY,
        filter,
        zIndex,
        transformPerspective: 900,
      }}
    >
      <Card title={title} Vignette={Vignette} />
    </motion.div>
  );
}

function Headline({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [24, 0, 0, -24]);
  const filter = useTransform(progress, range, [
    'blur(8px)',
    'blur(0px)',
    'blur(0px)',
    'blur(8px)',
  ]);
  return (
    <motion.h2
      style={{ opacity, y, filter }}
      className="absolute inset-x-0 top-10 text-center text-4xl font-medium text-balance md:text-5xl"
    >
      {children}
    </motion.h2>
  );
}

function OrbitStage() {
  const ref = useRef<HTMLElement>(null);
  const scale = useStageScale();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.4,
  });
  const drift = useMotionValue(0);
  useAnimationFrame((_, delta) => drift.set(drift.get() + delta * 0.00008));

  const enter = useTransform(progress, (p) => smooth(clamp(p / 0.2)));
  const settle = useTransform(progress, (p) => clamp((p - 0.6) / 0.18));
  const turn = useTransform(progress, (p) => clamp(p / 0.78) * Math.PI * 1.1);

  const logoScale = useTransform(
    progress,
    [0, 0.2, 0.6, 0.74],
    [0.5, 1, 1, 0.3],
  );
  const logoOpacity = useTransform(
    progress,
    [0, 0.12, 0.62, 0.72],
    [0, 1, 1, 0],
  );
  const logoRotate = useTransform(progress, [0, 0.74], [-60, 240]);
  const logoTilt = useTransform(progress, [0, 0.37, 0.74], [24, -12, 24]);
  const glow = useTransform(progress, [0, 0.2, 0.6, 0.74], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      data-slot="home-orbit"
      className="relative mt-24 h-[420vh]"
    >
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <div
          className="relative shrink-0"
          style={{
            width: STAGE.width,
            height: STAGE.height,
            transform: `scale(${scale})`,
          }}
        >
          <Headline progress={progress} range={[0.04, 0.14, 0.52, 0.62]}>
            Every primitive, alive.
          </Headline>
          <Headline progress={progress} range={[0.66, 0.76, 1, 1.01]}>
            Go ahead, play with them.
          </Headline>

          <motion.div
            aria-hidden="true"
            style={{ opacity: glow }}
            className="absolute top-1/2 left-1/2 -mt-[240px] -ml-[240px] size-[480px] rounded-full bg-foreground/10 blur-3xl"
          />
          <motion.div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 z-10 -mt-[120px] -ml-[128px]"
            style={{
              scale: logoScale,
              opacity: logoOpacity,
              rotate: logoRotate,
              rotateX: logoTilt,
              transformPerspective: 1200,
            }}
          >
            <AnimateUILogo className="h-[240px] w-[256px] text-foreground drop-shadow-[0_30px_60px_rgb(0_0_0/0.25)]" />
          </motion.div>

          {VIGNETTES.map(({ title }, index) => (
            <OrbitCard
              key={title}
              index={index}
              enter={enter}
              settle={settle}
              turn={turn}
              drift={drift}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StaticGrid() {
  return (
    <section
      data-slot="home-orbit"
      className="mx-auto mt-24 flex w-full max-w-[1000px] flex-col gap-8 px-5"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: ease.out }}
        className="text-center text-3xl font-medium text-balance md:text-5xl"
      >
        Every primitive, alive.
      </motion.h2>
      <div className="grid gap-4 md:grid-cols-3">
        {VIGNETTES.map(({ title, Vignette }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.6,
              ease: ease.out,
              delay: (index % COLUMNS) * 0.06,
            }}
            style={{ height: CARD.height + 20 }}
          >
            <Card title={title} Vignette={Vignette} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Orbit() {
  const wide = useWide();
  const reduce = useShouldReduceMotion();
  return wide && !reduce ? <OrbitStage /> : <StaticGrid />;
}
