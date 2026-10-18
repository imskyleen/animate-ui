'use client';

import * as React from 'react';
import { useInView } from 'motion/react';

import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { cn } from 'cn';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

const randColor = (): string => `hsl(${randInt(0, 360)}, 100%, 50%)`;

type ParticleType = {
  x: number;
  y: number;
  color: string;
  speed: number;
  direction: number;
  vx: number;
  vy: number;
  gravity: number;
  friction: number;
  alpha: number;
  decay: number;
  size: number;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  isAlive: () => boolean;
};

function createParticle(
  x: number,
  y: number,
  color: string,
  speed: number,
  direction: number,
  gravity: number,
  friction: number,
  size: number,
): ParticleType {
  const vx = Math.cos(direction) * speed;
  const vy = Math.sin(direction) * speed;
  const alpha = 1;
  const decay = rand(0.005, 0.02);

  return {
    x,
    y,
    color,
    speed,
    direction,
    vx,
    vy,
    gravity,
    friction,
    alpha,
    decay,
    size,
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    },
    isAlive() {
      return this.alpha > 0;
    },
  };
}

type FireworkType = {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
  size: number;
  angle: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  trailLength: number;
  exploded: boolean;
  update: () => boolean;
  explode: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

function createFirework(
  x: number,
  y: number,
  targetY: number,
  color: string,
  speed: number,
  size: number,
  particleSpeed: { min: number; max: number } | number,
  particleSize: { min: number; max: number } | number,
  onExplode: (particles: ParticleType[]) => void,
): FireworkType {
  const angle = -Math.PI / 2 + rand(-0.3, 0.3);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const trail: { x: number; y: number }[] = [];
  const trailLength = randInt(10, 25);

  return {
    x,
    y,
    targetY,
    color,
    speed,
    size,
    angle,
    vx,
    vy,
    trail,
    trailLength,
    exploded: false,
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.02;
      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
        return false;
      }
      return true;
    },
    explode() {
      const numParticles = randInt(50, 150);
      const particles: ParticleType[] = [];
      for (let i = 0; i < numParticles; i++) {
        const particleAngle = rand(0, Math.PI * 2);
        const localParticleSpeed = getValueByRange(particleSpeed);
        const localParticleSize = getValueByRange(particleSize);
        particles.push(
          createParticle(
            this.x,
            this.y,
            this.color,
            localParticleSpeed,
            particleAngle,
            0.05,
            0.98,
            localParticleSize,
          ),
        );
      }
      onExplode(particles);
    },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.beginPath();
      if (this.trail.length > 1) {
        ctx.moveTo(this.trail[0]?.x ?? this.x, this.trail[0]?.y ?? this.y);
        for (const point of this.trail) {
          ctx.lineTo(point.x, point.y);
        }
      } else {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    },
  };
}

function getValueByRange(range: { min: number; max: number } | number): number {
  if (typeof range === 'number') {
    return range;
  }
  return rand(range.min, range.max);
}

function getColor(color: string | string[] | undefined): string {
  if (Array.isArray(color)) {
    return color[randInt(0, color.length)] ?? randColor();
  }
  return color ?? randColor();
}

type FireworksBackgroundProps = Omit<React.ComponentProps<'div'>, 'color'> & {
  canvasProps?: React.ComponentProps<'canvas'>;
  population?: number;
  color?: string | string[];
  fireworkSpeed?: { min: number; max: number } | number;
  fireworkSize?: { min: number; max: number } | number;
  particleSpeed?: { min: number; max: number } | number;
  particleSize?: { min: number; max: number } | number;
};

function FireworksBackgroundContent({
  ref,
  className,
  canvasProps,
  population = 1,
  color,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 2, max: 7 },
  particleSize = { min: 1, max: 5 },
  ...props
}: FireworksBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;
  const stillKey = reduce
    ? JSON.stringify([color, particleSpeed, particleSize])
    : null;

  const optionsRef = React.useRef({
    population,
    color,
    fireworkSpeed,
    fireworkSize,
    particleSpeed,
    particleSize,
  });
  React.useEffect(() => {
    optionsRef.current = {
      population,
      color,
      fireworkSpeed,
      fireworkSize,
      particleSpeed,
      particleSize,
    };
  });

  const engineRef = React.useRef<{
    start: () => void;
    stop: () => void;
    still: () => void;
  } | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let maxX = 0;
    let maxY = 0;
    let scale = 1;

    const explosions: ParticleType[] = [];
    const fireworks: FireworkType[] = [];

    let running = false;
    let frameId = 0;
    let launchTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.globalAlpha = 1;
    };

    const render = () => {
      clear();
      for (let i = fireworks.length - 1; i >= 0; i--) fireworks[i]?.draw(ctx);
      for (let i = explosions.length - 1; i >= 0; i--) explosions[i]?.draw(ctx);
    };

    const setCanvasSize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      maxX = window.innerWidth;
      maxY = maxX * (height / width);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      scale = canvas.width / maxX;
      if (!running) render();
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    const resizeObserver = new ResizeObserver(setCanvasSize);
    resizeObserver.observe(container);

    const handleExplosion = (particles: ParticleType[]) => {
      explosions.push(...particles);
    };

    const addFirework = (x: number, targetY: number) => {
      const options = optionsRef.current;
      fireworks.push(
        createFirework(
          x,
          maxY,
          targetY,
          getColor(options.color),
          getValueByRange(options.fireworkSpeed),
          getValueByRange(options.fireworkSize),
          options.particleSpeed,
          options.particleSize,
          handleExplosion,
        ),
      );
    };

    const launchFirework = () => {
      const { population } = optionsRef.current;
      if (population > 0)
        addFirework(rand(maxX * 0.1, maxX * 0.9), rand(maxY * 0.1, maxY * 0.4));
      const timeout = rand(300, 800) / (population > 0 ? population : 1);
      launchTimeoutId = setTimeout(launchFirework, timeout);
    };

    const animate = () => {
      clear();

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        if (!firework?.update()) {
          fireworks.splice(i, 1);
        } else {
          firework.draw(ctx);
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const particle = explosions[i];
        particle?.update();
        if (particle?.isAlive()) {
          particle.draw(ctx);
        } else {
          explosions.splice(i, 1);
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (running) return;
      running = true;
      launchFirework();
      animate();
    };

    const stop = () => {
      running = false;
      clearTimeout(launchTimeoutId);
      cancelAnimationFrame(frameId);
    };

    const still = () => {
      if (running) return;
      fireworks.length = 0;
      explosions.length = 0;
      const options = optionsRef.current;
      for (let i = 0; i < 3; i++) {
        const firework = createFirework(
          maxX * (0.25 + i * 0.25),
          maxY * rand(0.25, 0.45),
          0,
          getColor(options.color),
          0,
          0,
          options.particleSpeed,
          options.particleSize,
          handleExplosion,
        );
        firework.explode();
      }
      for (let i = 0; i < 25; i++) {
        for (const particle of explosions) particle.update();
      }
      render();
    };

    const handleClick = (event: MouseEvent) => {
      if (!running) return;
      const rect = container.getBoundingClientRect();
      const unit = maxX / rect.width;
      addFirework(
        (event.clientX - rect.left) * unit,
        (event.clientY - rect.top) * unit,
      );
    };
    container.addEventListener('click', handleClick);

    engineRef.current = { start, stop, still };

    return () => {
      stop();
      engineRef.current = null;
      window.removeEventListener('resize', setCanvasSize);
      resizeObserver.disconnect();
      container.removeEventListener('click', handleClick);
    };
  }, []);

  React.useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (reduce) {
      engine.still();
      return;
    }
    if (!playing) return;
    engine.start();
    return engine.stop;
  }, [playing, reduce, stillKey]);

  return (
    <div
      ref={containerRef}
      data-slot="fireworks-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
    >
      <canvas
        aria-hidden="true"
        {...canvasProps}
        ref={canvasRef}
        className={cn('absolute inset-0 size-full', canvasProps?.className)}
      />
    </div>
  );
}

function FireworksBackground(props: FireworksBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <FireworksBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { FireworksBackground, type FireworksBackgroundProps };
