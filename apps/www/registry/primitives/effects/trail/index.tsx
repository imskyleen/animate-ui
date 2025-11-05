'use client';

import * as React from 'react';

type TrailProps = {
  trailLength?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  opacity?: number;
} & React.ComponentProps<'div'>;

type Point = { x: number; y: number };

function Trail({
  trailLength = 24,
  thickness = 6,
  glow = 12,
  speed = 0.22,
  opacity = 0.8,
  style,
  ...props
}: TrailProps) {
  const [points, setPoints] = React.useState<Point[]>([]);
  const mouseRef = React.useRef<Point>({ x: 0, y: 0 });
  const lastMouseRef = React.useRef<Point>({ x: 0, y: 0 });
  const lastTimeRef = React.useRef<number>(performance.now());
  const idleFramesRef = React.useRef<number>(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  React.useEffect(() => {
    const animate = (now: number) => {
      const dt = Math.max(0.001, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const m = mouseRef.current;
      const lm = lastMouseRef.current;
      const moved = Math.hypot(m.x - lm.x, m.y - lm.y);
      lastMouseRef.current = { x: m.x, y: m.y };

      setPoints((prev) => {
        let next = prev.length ? [...prev] : [];
        next.unshift({ x: m.x, y: m.y });

        const maxLen = trailLength;
        if (next.length > maxLen) next.length = maxLen;

        if (moved < 0.5) {
          idleFramesRef.current += 1;
          const extraDrop = Math.min(
            Math.ceil(maxLen * 0.25),
            Math.max(0, Math.floor(idleFramesRef.current * 0.5)),
          );
          if (extraDrop > 0) next.splice(-extraDrop);
        } else {
          idleFramesRef.current = 0;
        }

        if (next.length >= 3) {
          const follow = 1 - Math.exp(-(speed * 12) * dt);
          for (let i = 1; i < next.length; i++) {
            const p = next[i];
            const h = next[i - 1];
            next[i] = {
              x: p.x + (h.x - p.x) * follow,
              y: p.y + (h.y - p.y) * follow,
            };
          }
        }

        return next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trailLength, speed]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.parentNode !== document.body) document.body.appendChild(el);
    return () => {
      if (el.parentNode === document.body) document.body.removeChild(el);
    };
  }, []);

  const getPath = (pts: Point[]) => {
    if (!pts.length) return '';
    const d0 = `M${pts[0].x},${pts[0].y}`;
    if (pts.length < 2) return d0;
    let d = d0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: 'transparent',
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100%',
        height: '100%',
        ...style,
      }}
      {...props}
    >
      <svg
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <path
          d={getPath(points)}
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          opacity={opacity}
          style={{ filter: `drop-shadow(0 0 ${glow}px currentColor)` }}
        />
      </svg>
    </div>
  );
}

export { Trail, type TrailProps };
