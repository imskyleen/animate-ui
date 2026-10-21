'use client';

import { ease, useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from 'react';

import { cn } from 'cn';

import { AnimateUILogo } from '@/lib/libraries';

import { AutoplayScope, VIGNETTES } from './vignettes';

const STAGE = { width: 1200, height: 780 };
const CARD = { width: 300, height: 188 };
const GAP = 16;
const RADIUS = { x: 400, y: 240 };

type Vignettes = typeof VIGNETTES;
const VignettesContext = createContext<Vignettes>(VIGNETTES);
const columnsOf = (count: number) => (count === 4 ? 2 : 3);

/** How many cards sit in a row: the last one may be shorter, and centered. */
const rowLength = (count: number, columns: number, row: number) =>
  Math.min(columns, count - row * columns);

// A short last row of a 3-column grid starts one or two half-columns in.
const LAST_ROW_START = ['', 'md:col-start-3', 'md:col-start-2'];

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
          (window.innerHeight - 80) / STAGE.height,
        ),
      );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}

const OnScreenContext = createContext(true);

function Card({ title, Vignette }: { title: string; Vignette: ComponentType }) {
  const [hovered, setHovered] = useState(false);
  const onScreen = use(OnScreenContext);
  return (
    <div
      data-slot="orbit-card"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="flex size-full flex-col rounded-xl bg-accent p-1"
    >
      <div className="relative flex flex-1 flex-col rounded-lg bg-background">
        <span className="absolute top-2.5 left-3.5 text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex flex-1 items-center justify-center p-4 pt-7">
          <AutoplayScope paused={hovered || !onScreen}>
            <Vignette />
          </AutoplayScope>
        </div>
      </div>
    </div>
  );
}

type Placement = {
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
  rotateY: number;
  z: number;
};

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
  const vignettes = use(VignettesContext);
  const { title, Vignette } = vignettes[index]!;
  const count = vignettes.length;
  const columns = columnsOf(count);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const rows = Math.ceil(count / columns);
  const slot = {
    x: (column - (rowLength(count, columns, row) - 1) / 2) * (CARD.width + GAP),
    y: (row - (rows - 1) / 2) * (CARD.height + GAP) + 40,
  };

  const place = useTransform(
    [enter, settle, turn, drift] as MotionValue<number>[],
    ([e, s, t, d]: number[]) => {
      const angle = (index / count) * Math.PI * 2 + t! + d! * (1 - s!);
      const depth = (Math.sin(angle) + 1) / 2;
      const reach = 0.3 + 0.7 * e!;
      const orbit = {
        x: Math.cos(angle) * RADIUS.x * reach,
        y: Math.sin(angle) * RADIUS.y * reach + 30,
        scale: 0.7 + 0.3 * depth,
        blur: (1 - depth) * 1.6 + (1 - e!) * 8,
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

  const ref = useRef<HTMLDivElement>(null);
  const apply = useCallback((p: Placement) => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = `perspective(900px) translate(${round(p.x, 1)}px, ${round(p.y, 1)}px) scale(${round(p.scale, 3)}) rotateY(${round(p.rotateY, 2)}deg)`;
    element.style.opacity = String(round(p.opacity, 3));
    element.style.filter =
      p.blur > 0.05 ? `blur(${round(p.blur, 1)}px)` : 'none';
    element.style.zIndex = String(p.z);
  }, []);
  useMotionValueEvent(place, 'change', apply);
  useLayoutEffect(() => apply(place.get()), [apply, place]);

  return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2"
      style={{
        width: CARD.width,
        height: CARD.height,
        marginLeft: -CARD.width / 2,
        marginTop: -CARD.height / 2,
        opacity: 0,
      }}
    >
      <Card title={title} Vignette={Vignette} />
    </div>
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
  const vignettes = use(VignettesContext);
  const ref = useRef<HTMLElement>(null);
  const onScreen = useInView(ref);
  const scale = useStageScale();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.4,
  });
  const drift = useMotionValue(0);

  const enter = useTransform(progress, (p) => smooth(clamp((p - 0.12) / 0.25)));
  const [entered, setEntered] = useState(false);
  useMotionValueEvent(enter, 'change', (value) => setEntered(value > 0.001));
  const settle = useTransform(progress, (p) => clamp((p - 0.86) / 0.12));
  const turn = useTransform(progress, (p) => clamp(p / 0.86) * Math.PI * 1.1);
  useAnimationFrame((_, delta) => {
    if (settle.get() === 0) drift.set(drift.get() + delta * 0.00008);
  });

  const logoScale = useTransform(
    progress,
    [0, 0.3, 0.86, 0.95],
    [0.8, 1, 1, 0.3],
  );
  const logoOpacity = useTransform(progress, [0, 0.86, 0.94], [1, 1, 0]);
  const logoRotate = useTransform(progress, [0, 0.95], [-60, 240]);
  const logoTilt = useTransform(progress, [0, 0.48, 0.95], [24, -12, 24]);
  const glow = useTransform(progress, [0, 0.3, 0.86, 0.95], [0.5, 1, 1, 0]);

  return (
    <OnScreenContext value={onScreen && entered}>
      <section
        ref={ref}
        data-slot="home-orbit"
        className="relative mt-24 h-[300vh]"
      >
        <div className="sticky top-20 flex h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden">
          <div
            className="relative shrink-0"
            style={{
              width: STAGE.width,
              height: STAGE.height,
              transform: `scale(${scale})`,
            }}
          >
            <Headline progress={progress} range={[-0.01, 0, 0.78, 0.87]}>
              Every primitive, alive.
            </Headline>
            <Headline progress={progress} range={[0.9, 0.97, 1, 1.01]}>
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

            {vignettes.map(({ title }, index) => (
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
    </OnScreenContext>
  );
}

function StaticGrid() {
  const vignettes = use(VignettesContext);
  const columns = columnsOf(vignettes.length);
  const ref = useRef<HTMLElement>(null);
  const onScreen = useInView(ref);
  return (
    <OnScreenContext value={onScreen}>
      <section
        ref={ref}
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
        <div
          className={cn(
            'grid gap-4',
            columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-6',
          )}
        >
          {vignettes.map(({ title, Vignette }, index) => (
            <motion.div
              key={title}
              className={cn(
                columns === 3 && 'md:col-span-2',
                columns === 3 &&
                  index === vignettes.length - (vignettes.length % 3) &&
                  LAST_ROW_START[vignettes.length % 3],
              )}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                ease: ease.out,
                delay: (index % columns) * 0.06,
              }}
              style={{ height: CARD.height + 20 }}
            >
              <Card title={title} Vignette={Vignette} />
            </motion.div>
          ))}
        </div>
      </section>
    </OnScreenContext>
  );
}

/** `only`: the vignettes to show, by title (the components a framework has). */
export function Orbit({ only }: { only?: string[] }) {
  const wide = useWide();
  const reduce = useShouldReduceMotion();
  const vignettes = only
    ? VIGNETTES.filter(({ title }) => only.includes(title))
    : VIGNETTES;
  return (
    <VignettesContext value={vignettes}>
      {wide && !reduce ? <OrbitStage /> : <StaticGrid />}
    </VignettesContext>
  );
}
