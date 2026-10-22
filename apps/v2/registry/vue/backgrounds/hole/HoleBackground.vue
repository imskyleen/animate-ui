<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { usePageVisible } from '@animate-ui/vue/utils/use-page-visible'
import { cn } from 'cn'
import { motion, useInView } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    strokeColor?: string
    numberOfLines?: number
    numberOfDiscs?: number
    particleRGBColor?: [number, number, number]
  }>(),
  {
    strokeColor: '#737373',
    numberOfLines: 50,
    numberOfDiscs: 50,
    particleRGBColor: () => [255, 255, 255],
  },
)

const HOLE_CLASSES = [
  'relative size-full overflow-hidden',
  'before:pointer-events-none after:pointer-events-none',
  'before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:block before:size-[140%] dark:before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,black_50%)] before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,white_50%)] before:[transform:translate3d(-50%,-50%,0)]',
  'after:content-[""] after:absolute after:z-[5] after:top-1/2 after:left-1/2 after:block after:size-full after:[background:radial-gradient(ellipse_at_50%_75%,#a900ff_20%,transparent_75%)] after:[transform:translate3d(-50%,-50%,0)] after:mix-blend-overlay',
]

const canvas = shallowRef<HTMLCanvasElement | null>(null)
// The drawing code reads the canvas through `.current`, as in the React version.
const canvasRef = { get current() { return canvas.value } }

const inView = useInView(canvas)
const pageVisible = usePageVisible()
const reduce = useShouldReduceMotion()
const playing = computed(() => inView.value && pageVisible.value && !reduce.value)

const stateRef: { current: any } = { current: {
  discs: [] as any[],
  lines: [] as any[],
  particles: [] as any[],
  clip: {},
  startDisc: {},
  endDisc: {},
  rect: { width: 0, height: 0 },
  render: { width: 0, height: 0, dpi: 1 },
  particleArea: {},
  linesCanvas: null,
} };

const linear = (p: number) => p;
const easeInExpo = (p: number) => (p === 0 ? 0 : Math.pow(2, 10 * (p - 1)));

const tweenValue = (start: number, end: number, p: number, ease: 'inExpo' | null = null) => {
    const delta = end - start;
    const easeFn = ease === 'inExpo' ? easeInExpo : linear;
    return start + delta * easeFn(p);
  };

const tweenDisc = (disc: any) => {
    const { startDisc, endDisc } = stateRef.current;
    disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
    disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, 'inExpo');
    disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
    disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
  };

const setSize = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  stateRef.current.rect = { width: rect.width, height: rect.height };
  stateRef.current.render = {
    width: rect.width,
    height: rect.height,
    dpi: Math.min(window.devicePixelRatio || 1, 2),
  };
  canvas.width = Math.max(
    1,
    Math.round(stateRef.current.render.width * stateRef.current.render.dpi),
  );
  canvas.height = Math.max(
    1,
    Math.round(stateRef.current.render.height * stateRef.current.render.dpi),
  );
};

const setDiscs = () => {
  const { width, height } = stateRef.current.rect;
  stateRef.current.discs = [];
  stateRef.current.startDisc = {
    x: width * 0.5,
    y: height * 0.45,
    w: width * 0.75,
    h: height * 0.7,
  };
  stateRef.current.endDisc = {
    x: width * 0.5,
    y: height * 0.95,
    w: 0,
    h: 0,
  };
  let prevBottom = height;
  stateRef.current.clip = {};
  for (let i = 0; i < props.numberOfDiscs; i++) {
    const p = i / props.numberOfDiscs;
    const disc = { p, x: 0, y: 0, w: 0, h: 0 };
    tweenDisc(disc);
    const bottom = disc.y + disc.h;
    if (bottom <= prevBottom) {
      stateRef.current.clip = { disc: { ...disc }, i };
    }
    prevBottom = bottom;
    stateRef.current.discs.push(disc);
  }
  if (!stateRef.current.clip.disc)
    stateRef.current.clip = { disc: { ...stateRef.current.startDisc }, i: 0 };
  const clipPath = new Path2D();
  const disc = stateRef.current.clip.disc;
  clipPath.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
  clipPath.rect(disc.x - disc.w, 0, disc.w * 2, disc.y);
  stateRef.current.clip.path = clipPath;
};

const setLines = () => {
  const { width, height } = stateRef.current.rect;
  stateRef.current.lines = [];
  const linesAngle = (Math.PI * 2) / props.numberOfLines;
  for (let i = 0; i < props.numberOfLines; i++) {
    stateRef.current.lines.push([]);
  }
  stateRef.current.discs.forEach((disc: any) => {
    for (let i = 0; i < props.numberOfLines; i++) {
      const angle = i * linesAngle;
      const p = {
        x: disc.x + Math.cos(angle) * disc.w,
        y: disc.y + Math.sin(angle) * disc.h,
      };
      stateRef.current.lines[i].push(p);
    }
  });
  const { dpi } = stateRef.current.render;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = Math.max(1, Math.round(width * dpi));
  offCanvas.height = Math.max(1, Math.round(height * dpi));
  const ctx = offCanvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpi, dpi);
  stateRef.current.lines.forEach((line: any) => {
    ctx.save();
    let lineIsIn = false;
    line.forEach((p1: any, j: number) => {
      if (j === 0) return;
      const p0 = line[j - 1];
      if (
        !lineIsIn &&
        (ctx.isPointInPath(
          stateRef.current.clip.path,
          p1.x * dpi,
          p1.y * dpi,
        ) ||
          ctx.isPointInStroke(
            stateRef.current.clip.path,
            p1.x * dpi,
            p1.y * dpi,
          ))
      ) {
        lineIsIn = true;
      } else if (lineIsIn) {
        ctx.clip(stateRef.current.clip.path);
      }
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = props.strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    });
    ctx.restore();
  });
  stateRef.current.linesCanvas = offCanvas;
};

const initParticle = (start: boolean = false) => {
    const sx =
      stateRef.current.particleArea.sx +
      stateRef.current.particleArea.sw * Math.random();
    const ex =
      stateRef.current.particleArea.ex +
      stateRef.current.particleArea.ew * Math.random();
    const dx = ex - sx;
    const y = start
      ? stateRef.current.particleArea.h * Math.random()
      : stateRef.current.particleArea.h;
    const r = 0.5 + Math.random() * 4;
    const vy = 0.5 + Math.random();
    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      p: 0,
      r,
      c: `rgba(${props.particleRGBColor[0]}, ${props.particleRGBColor[1]}, ${props.particleRGBColor[2]}, ${Math.random()})`,
    };
  };

const setParticles = () => {
  const { width, height } = stateRef.current.rect;
  stateRef.current.particles = [];
  const disc = stateRef.current.clip.disc;
  stateRef.current.particleArea = {
    sw: disc.w * 0.5,
    ew: disc.w * 2,
    h: height * 0.85,
  };
  stateRef.current.particleArea.sx =
    (width - stateRef.current.particleArea.sw) / 2;
  stateRef.current.particleArea.ex =
    (width - stateRef.current.particleArea.ew) / 2;
  const totalParticles = 100;
  for (let i = 0; i < totalParticles; i++) {
    stateRef.current.particles.push(initParticle(true));
  }
};

const drawDiscs = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = props.strokeColor;
    ctx.lineWidth = 2;
    const outerDisc = stateRef.current.startDisc;
    ctx.beginPath();
    ctx.ellipse(
      outerDisc.x,
      outerDisc.y,
      outerDisc.w,
      outerDisc.h,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.closePath();
    stateRef.current.discs.forEach((disc: any, i: number) => {
      if (i % 5 !== 0) return;
      if (disc.w < stateRef.current.clip.disc.w - 5) {
        ctx.save();
        ctx.clip(stateRef.current.clip.path);
      }
      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      if (disc.w < stateRef.current.clip.disc.w - 5) {
        ctx.restore();
      }
    });
  };

const drawLines = (ctx: CanvasRenderingContext2D) => {
  if (stateRef.current.linesCanvas) {
    const { width, height } = stateRef.current.rect;
    ctx.drawImage(stateRef.current.linesCanvas, 0, 0, width, height);
  }
};

const drawParticles = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.clip(stateRef.current.clip.path);
  stateRef.current.particles.forEach((particle: any) => {
    ctx.fillStyle = particle.c;
    ctx.beginPath();
    ctx.rect(particle.x, particle.y, particle.r, particle.r);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
};

const moveDiscs = () => {
  stateRef.current.discs.forEach((disc: any) => {
    disc.p = (disc.p + 0.001) % 1;
    tweenDisc(disc);
  });
};

const moveParticles = () => {
  stateRef.current.particles.forEach((particle: any, idx: number) => {
    particle.p = 1 - particle.y / stateRef.current.particleArea.h;
    particle.x = particle.sx + particle.dx * particle.p;
    particle.y -= particle.vy;
    if (particle.y < 0) {
      stateRef.current.particles[idx] = initParticle();
    }
  });
};

const draw = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(stateRef.current.render.dpi, stateRef.current.render.dpi);
  drawDiscs(ctx);
  drawLines(ctx);
  drawParticles(ctx);
  ctx.restore();
};

const init = () => {
  setSize();
  setDiscs();
  setLines();
  setParticles();
};

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  const el = canvasRef.current
  if (!el) return
  const handleResize = () => {
    const rect = el.getBoundingClientRect()
    const { width, height, dpi } = stateRef.current.render
    if (
      rect.width === width
      && rect.height === height
      && Math.min(window.devicePixelRatio || 1, 2) === dpi
    )
      return
    init()
    draw()
  }
  init()
  draw()
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(el)
})
watch(
  () => [props.strokeColor, props.numberOfLines, props.numberOfDiscs, ...props.particleRGBColor],
  () => {
    if (!canvasRef.current) return
    init()
    draw()
  },
)

let frameId = 0
watch(
  playing,
  (now) => {
    cancelAnimationFrame(frameId)
    if (!now) return
    const tick = () => {
      moveDiscs()
      moveParticles()
      draw()
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  cancelAnimationFrame(frameId)
})
</script>

<template>
  <ReducedMotionConfig>
    <div
      data-slot="hole-background"
      :class="cn(HOLE_CLASSES, props.class)"
      v-bind="$attrs"
    >
      <slot />
      <canvas
        ref="canvas"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 block size-full dark:opacity-20 opacity-10"
      />
      <motion.div
        aria-hidden="true"
        :class="cn(
          'pointer-events-none absolute top-[-71.5%] left-1/2 z-[3] w-[30%] h-[140%] rounded-b-full blur-3xl opacity-75 dark:mix-blend-plus-lighter mix-blend-plus-darker [transform:translate3d(-50%,0,0)] [background-position:0%_100%] [background-size:100%_200%]',
          'dark:[background:linear-gradient(20deg,#00f8f1,#ffbd1e20_16.5%,#fe848f_33%,#fe848f20_49.5%,#00f8f1_66%,#00f8f160_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%] [background:linear-gradient(20deg,#00f8f1,#ffbd1e40_16.5%,#fe848f_33%,#fe848f40_49.5%,#00f8f1_66%,#00f8f180_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%]',
        )"
        :animate="{ backgroundPosition: playing ? '0% 300%' : '0% 100%' }"
        :transition="playing ? { duration: 5, ease: 'linear', repeat: Infinity } : { duration: 0 }"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute top-0 left-0 z-[7] size-full dark:[background:repeating-linear-gradient(transparent,transparent_1px,white_1px,white_2px)] mix-blend-overlay opacity-50"
      />
    </div>
  </ReducedMotionConfig>
</template>
