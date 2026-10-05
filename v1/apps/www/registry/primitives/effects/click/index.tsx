'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  type HTMLMotionProps,
  type SVGMotionProps,
} from 'motion/react';

type ClickVariant = 'ripple' | 'ring' | 'crosshair' | 'burst' | 'particles';

type Item = {
  id: string;
  x: number;
  y: number;
  variant: ClickVariant;
  color: string;
  size: number;
  duration: number;
};

type ClickCommonProps = {
  children?: React.ReactNode;
  color?: string;
  size?: number;
  duration?: number;
  scope?: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
};

type RippleClickProps = HTMLMotionProps<'div'> &
  ClickCommonProps & {
    variant: 'ripple';
  };

type SvgClickProps = SVGMotionProps<'svg'> &
  ClickCommonProps & {
    variant?: Exclude<ClickVariant, 'ripple'>;
  };

type ClickProps = RippleClickProps | SvgClickProps;

function Click(props: RippleClickProps): React.ReactElement | null;
function Click(props: SvgClickProps): React.ReactElement | null;
function Click(props: ClickProps): React.ReactElement | null {
  const {
    children,
    variant = 'ring',
    color = 'currentColor',
    size = 100,
    duration = 400,
    scope,
    disabled = false,
  } = props as ClickProps;
  const [items, setItems] = React.useState<Item[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (disabled) return;
    const target = scope?.current ?? document;
    const isDoc = target instanceof Document;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el: any = isDoc ? document : target;
    if (!el) return;
    function onPointerUp(e: PointerEvent) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!isDoc) {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          return;
        }
      }
      const x = e.clientX;
      const y = e.clientY;
      const id = crypto.randomUUID();
      const item: Item = {
        id,
        x,
        y,
        variant,
        color,
        size,
        duration,
      };
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }, duration + 300);
    }
    el.addEventListener('pointerup', onPointerUp, { passive: true });
    return () => el.removeEventListener('pointerup', onPointerUp);
  }, [scope, variant, color, size, duration, disabled]);

  const portal = typeof window !== 'undefined' ? document.body : null;

  return (
    <>
      {children}
      {portal &&
        createPortal(
          <div
            ref={containerRef}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999999999,
            }}
          >
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <EffectRenderer key={it.id} item={it} />
              ))}
            </AnimatePresence>
          </div>,
          portal,
        )}
    </>
  );
}

function EffectRenderer({ item }: { item: Item }) {
  if (item.variant === 'ripple') return <Ripple item={item} />;
  if (item.variant === 'ring') return <Ring item={item} />;
  if (item.variant === 'crosshair') return <Crosshair item={item} />;
  if (item.variant === 'burst') return <Burst item={item} />;
  if (item.variant === 'particles') return <Particles item={item} />;
  return null;
}

function Ripple({ item }: { item: Item }) {
  const r = item.size;
  const d = item.duration / 1000;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.2 }}
      animate={{ opacity: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: d, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: item.x - r / 2,
        top: item.y - r / 2,
        width: r,
        height: r,
        borderRadius: '9999px',
        background: item.color,
        boxShadow: `0 0 0 2px ${item.color} inset`,
        willChange: 'transform, opacity',
      }}
    />
  );
}

function Ring({ item }: { item: Item }) {
  const d = item.duration / 1000;

  const rEnd = Math.max(item.size / 1.5, 50);
  const rStart = Math.max(Math.floor(rEnd * 0.2), 12);

  const strokeStart = Math.max(Math.floor(rEnd * 0.05), 2.5);
  const strokeEnd = 0;

  return (
    <motion.svg
      style={{
        position: 'fixed',
        left: item.x - rEnd / 2,
        top: item.y - rEnd / 2,
        width: rEnd,
        height: rEnd,
        display: 'block',
        overflow: 'visible',
      }}
      viewBox={`0 0 ${rEnd} ${rEnd}`}
    >
      <motion.circle
        cx={rEnd / 2}
        cy={rEnd / 2}
        fill="none"
        stroke={item.color}
        initial={{ r: rStart, strokeWidth: strokeStart }}
        animate={{ r: rEnd, strokeWidth: strokeEnd }}
        transition={{ duration: d, ease: 'easeOut' }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function Crosshair({ item }: { item: Item }) {
  const d = item.duration / 1000;

  const distanceEnd = Math.max(item.size * 0.65, 56);
  const gapStart = Math.max(item.size * 0.05, 3);
  const lenStart = Math.max(item.size * 0.26, 16);
  const lenEnd = Math.max(lenStart * 0.55, 6);

  const strokeWidth = Math.max(item.size * 0.065, 2);

  const half = distanceEnd + gapStart + lenStart;
  const box = half * 2;
  const cx = half,
    cy = half;

  const dirs = [
    { dx: +1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: +1 },
  ] as const;

  return (
    <motion.svg
      style={{
        position: 'fixed',
        left: item.x - half,
        top: item.y - half,
        width: box,
        height: box,
        display: 'block',
        overflow: 'visible',
        pointerEvents: 'none',
        rotate: '-25deg',
        strokeWidth,
      }}
      viewBox={`0 0 ${box} ${box}`}
    >
      {dirs.map((dir, i) => {
        const x1_0 = cx + dir.dx * gapStart;
        const y1_0 = cy + dir.dy * gapStart;
        const x2_0 = cx + dir.dx * (gapStart + lenStart);
        const y2_0 = cy + dir.dy * (gapStart + lenStart);

        const x1_1 = cx + dir.dx * distanceEnd;
        const y1_1 = cy + dir.dy * distanceEnd;
        const x2_1 = cx + dir.dx * (distanceEnd + lenEnd);
        const y2_1 = cy + dir.dy * (distanceEnd + lenEnd);

        return (
          <motion.line
            key={i}
            x1={x1_0}
            y1={y1_0}
            x2={x2_0}
            y2={y2_0}
            initial={{ pathLength: 1, scale: 1 }}
            animate={{
              x1: x1_1,
              y1: y1_1,
              x2: x2_1,
              y2: y2_1,
              pathLength: 0,
              scale: 0,
            }}
            transition={{ duration: d, ease: [0, 0, 0.7, 1] }}
            stroke={item.color}
          />
        );
      })}
    </motion.svg>
  );
}

function Burst({ item }: { item: Item }) {
  const d = item.duration / 1000;

  const rStart = Math.max(item.size * 0.4, 36);
  const rEnd = Math.max(item.size * 0.65, 56);

  const segCount = 4;
  const lenStart = Math.max(item.size * 0.2, 14);
  const lenEnd = Math.max(lenStart * 0.5, 6);
  const strokeWidth = Math.max(item.size * 0.05, 1.5);

  const startDeg = 180;
  const endDeg = 270;

  const half = rEnd + lenStart;
  const box = half * 2;
  const cx = half,
    cy = half;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <motion.svg
      style={{
        position: 'fixed',
        left: item.x - half,
        top: item.y - half,
        width: box,
        height: box,
        display: 'block',
        overflow: 'visible',
        pointerEvents: 'none',
        strokeWidth,
      }}
      viewBox={`0 0 ${box} ${box}`}
    >
      {Array.from({ length: segCount }).map((_, i) => {
        const t = i / Math.max(1, segCount - 1);
        const deg = startDeg + (endDeg - startDeg) * t;
        const th = toRad(deg);

        const ux = Math.cos(th);
        const uy = Math.sin(th);

        const c0x = cx + ux * rStart;
        const c0y = cy + uy * rStart;
        const c1x = cx + ux * rEnd;
        const c1y = cy + uy * rEnd;

        return (
          <motion.line
            key={i}
            x1={c0x - ux * (lenStart / 2)}
            y1={c0y - uy * (lenStart / 2)}
            x2={c0x + ux * (lenStart / 2)}
            y2={c0y + uy * (lenStart / 2)}
            initial={{ pathLength: 1, scale: 1 }}
            animate={{
              x1: [
                c0x - ux * (lenStart / 2),
                c1x - ux * (lenEnd / 2),
                c1x - ux * (lenEnd / 2),
              ],
              y1: [
                c0y - uy * (lenStart / 2),
                c1y - uy * (lenEnd / 2),
                c1y - uy * (lenEnd / 2),
              ],
              x2: [
                c0x + ux * (lenStart / 2),
                c1x + ux * (lenEnd / 2),
                c1x + ux * (lenEnd / 2),
              ],
              y2: [
                c0y + uy * (lenStart / 2),
                c1y + uy * (lenEnd / 2),
                c1y + uy * (lenEnd / 2),
              ],
              pathLength: [1, 0.5, 0.5],
              scale: [1, 1, 0],
            }}
            transition={{
              duration: d,
              ease: 'easeInOut',
              times: [0, 0.7, 1],
            }}
            stroke={item.color}
          />
        );
      })}
    </motion.svg>
  );
}

function Particles({ item }: { item: Item }) {
  const d = item.duration / 1000;

  const count = 6;
  const radius = item.size * 0.35;
  const r0 = Math.max(item.size * 0.025, 2);

  const half = radius + r0 * 2;
  const box = half * 2;
  const cx = half,
    cy = half;

  const angleStep = (2 * Math.PI) / count;

  return (
    <motion.svg
      style={{
        position: 'fixed',
        left: item.x - half,
        top: item.y - half,
        width: box,
        height: box,
        display: 'block',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
      viewBox={`0 0 ${box} ${box}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = i * angleStep;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r0}
            fill={item.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              cx: cx + x,
              cy: cy + y,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: d,
              delay: i * (d * 0.08),
              ease: 'easeOut',
            }}
          />
        );
      })}
    </motion.svg>
  );
}

export { Click, type ClickProps, type ClickVariant };
