'use client';

import * as React from 'react';
import {
  animate,
  cancelFrame,
  frame,
  motionValue,
  useInView,
  type MotionValue,
} from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import { usePageVisible } from '@animate-ui/react/utils/use-page-visible';
import { cn } from 'cn';

const CHARACTERS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_WAVES = 12;
const TRAIL = 12;
const TRAIL_LIFE = 700;
const WAVE_LIFE = 4;
const WAVE_GAP = 0.3;
const WAVE_SPEED = 560;
const WAVE_SLOWDOWN = 0.66;
const WAVE_EDGE = 10;
const WAVE_TAIL = 30;
const DRIFT = [-30, 12] as const;
const ACTIVITY_DECAY = 900;

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec3 accent;
uniform vec4 waves[${MAX_WAVES * 2}];
uniform vec4 trail[${TRAIL}];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

float outline(float kind, float angle, float phase) {
  if (kind < 0.5) return 1.0;
  if (kind < 1.5) {
    float s = sin(angle);
    float c = cos(angle);
    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;
  }
  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  float ring = 0.0;
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float angle = atan(-v.y, v.x);
    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);
    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / ${WAVE_EDGE.toFixed(1)} : d / ${WAVE_TAIL.toFixed(1)};
    ring = max(ring, exp(-k * k) * a.w);
  }

  float hover = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float seed = hash(index);
  float epoch = floor(time * 0.08 * (0.4 + seed) + seed * 97.0);
  float character = floor(hash(index + epoch * 0.137) * count);
  vec2 local = fract(pixel / cell);
  float ink = pow(texture2D(atlas, vec2((character + local.x) / count, local.y)).a, 1.7);

  float grey = ink * clamp(rest + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.6 + 0.4 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.72;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + accent * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;

type Wave = {
  x: number;
  y: number;
  kind: number;
  phase: number;
  strength: number;
  age: MotionValue<number>;
};

type GlyphBackgroundProps = React.ComponentProps<'div'> & {
  glowColor?: string;
  shapeColor?: string;
  fontSize?: number;
  interactive?: boolean;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function toRgb(color: string): [number, number, number] {
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) return [0.9, 0.9, 0.9];
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r! / 255, g! / 255, b! / 255];
}

function drawAtlas(cellWidth: number, cellHeight: number, font: string) {
  const atlas = document.createElement('canvas');
  atlas.width = Math.ceil(cellWidth * CHARACTERS.length);
  atlas.height = Math.ceil(cellHeight);
  const context = atlas.getContext('2d')!;
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';
  for (let i = 0; i < CHARACTERS.length; i++)
    context.fillText(CHARACTERS[i]!, (i + 0.5) * cellWidth, cellHeight / 2);
  return atlas;
}

type Frame = {
  width: number;
  height: number;
  dpr: number;
  cell: [number, number];
  time: number;
  activity: number;
  drift: [number, number];
  color: [number, number, number];
  accent: [number, number, number];
  waves: Float32Array;
  trail: Float32Array;
};

function createRenderer(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const at = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    atlas: at('atlas'),
    size: at('size'),
    cell: at('cell'),
    dpr: at('dpr'),
    count: at('count'),
    time: at('time'),
    rest: at('rest'),
    haze: at('haze'),
    hoverInk: at('hoverInk'),
    activity: at('activity'),
    drift: at('drift'),
    color: at('color'),
    accent: at('accent'),
    waves: at('waves'),
    trail: at('trail'),
  };
  gl.uniform1i(uniforms.atlas, 0);
  gl.uniform1f(uniforms.count, CHARACTERS.length);
  gl.uniform1f(uniforms.rest, 0);
  gl.uniform1f(uniforms.haze, 0.1);
  gl.uniform1f(uniforms.hoverInk, 0.3);

  return {
    atlas(image: HTMLCanvasElement) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
    },
    draw(frame: Frame) {
      gl.viewport(0, 0, frame.width, frame.height);
      gl.uniform2f(uniforms.size, frame.width, frame.height);
      gl.uniform2f(uniforms.cell, ...frame.cell);
      gl.uniform1f(uniforms.dpr, frame.dpr);
      gl.uniform1f(uniforms.time, frame.time);
      gl.uniform1f(uniforms.activity, frame.activity);
      gl.uniform2f(uniforms.drift, ...frame.drift);
      gl.uniform3f(uniforms.color, ...frame.color);
      gl.uniform3f(uniforms.accent, ...frame.accent);
      gl.uniform4fv(uniforms.waves, frame.waves);
      gl.uniform4fv(uniforms.trail, frame.trail);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

function GlyphBackgroundContent({
  ref,
  glowColor,
  shapeColor,
  fontSize = 10,
  interactive = true,
  className,
  children,
  onPointerMove,
  onPointerDown,
  ...props
}: GlyphBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const playing = inView && pageVisible && !reduce;

  const wavesRef = React.useRef<Wave[]>([]);
  const trailRef = React.useRef<{ x: number; y: number; t: number }[]>([]);
  const drawRef = React.useRef<(time: number, looping?: boolean) => void>(
    () => {},
  );
  const timeRef = React.useRef(0);
  const activityRef = React.useRef({ value: 0, at: 0 });

  const options = { glowColor, shapeColor, fontSize };
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const spawn = (x: number, y: number) => {
    const kind = 1 + Math.floor(Math.random() * 2);
    const phase = Math.random() * Math.PI * 2;
    for (const [delay, strength] of [
      [0, 1],
      [WAVE_GAP, 0.55],
    ] as const) {
      const wave: Wave = {
        x,
        y,
        kind,
        phase,
        strength,
        age: motionValue(0),
      };
      wavesRef.current = [...wavesRef.current.slice(1 - MAX_WAVES), wave];
      animate(wave.age, WAVE_LIFE, {
        duration: WAVE_LIFE,
        delay,
        ease: 'linear',
      }).then(() => {
        wavesRef.current = wavesRef.current.filter((w) => w !== wave);
      });
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: false,
    });
    const renderer = gl ? createRenderer(gl) : null;
    if (!renderer) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cell: [number, number] = [7, 13];
    let frames = 0;
    let colorKey = '';
    let color: [number, number, number] = [0.9, 0.9, 0.9];
    let accent: [number, number, number] = [0.9, 0.9, 0.9];
    const waves = new Float32Array(MAX_WAVES * 8);
    const trail = new Float32Array(TRAIL * 4);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const { fontSize } = optionsRef.current;
      const font = `${fontSize * dpr}px Menlo, ui-monospace, SFMono-Regular, Consolas, monospace`;
      const measure = document.createElement('canvas').getContext('2d')!;
      measure.font = font;
      cell = [
        Math.round(measure.measureText('0').width),
        Math.round(fontSize * 1.25 * dpr),
      ];
      renderer.atlas(drawAtlas(cell[0], cell[1], font));
    };

    const draw = (time: number, looping = false) => {
      if (width === 0 || height === 0) return;
      const { glowColor, shapeColor } = optionsRef.current;
      if (!looping || frames++ % 30 === 0) {
        const text = getComputedStyle(container).color || '#e5e5e5';
        const key = `${glowColor ?? text}|${shapeColor ?? text}`;
        if (key !== colorKey) {
          colorKey = key;
          color = toRgb(glowColor ?? text);
          accent = toRgb(shapeColor ?? text);
        }
      }
      waves.fill(0);
      wavesRef.current.forEach((wave, i) => {
        const age = wave.age.get();
        if (age <= 0) return;
        const radius = (WAVE_SPEED * age) / (1 + WAVE_SLOWDOWN * age);
        const fade =
          Math.min(1, age / 0.05) *
          Math.exp(-Math.max(0, age - 0.4) / 1.3) *
          Math.min(1, (WAVE_LIFE - age) / 0.5);
        waves[i * 8] = wave.x;
        waves[i * 8 + 1] = wave.y;
        waves[i * 8 + 2] = radius;
        waves[i * 8 + 3] = fade * wave.strength;
        waves[i * 8 + 4] = wave.kind;
        waves[i * 8 + 5] = 0.12 + 0.5 * Math.min(1, age / 2.2);
        waves[i * 8 + 6] = wave.phase;
        waves[i * 8 + 7] = age * 3;
      });
      trail.fill(0);
      trailRef.current.forEach((point, i) => {
        const age = (time - point.t) / TRAIL_LIFE;
        if (age < 0 || age >= 1) return;
        trail[i * 4] = point.x;
        trail[i * 4 + 1] = point.y;
        trail[i * 4 + 2] = 40 + 25 * age;
        trail[i * 4 + 3] = 0.3 * (1 - age) * (1 - age);
      });
      const seconds = time / 1000;
      const energy = activityRef.current;
      const activity =
        energy.value *
        Math.exp(-Math.max(0, time - energy.at) / ACTIVITY_DECAY);
      renderer.draw({
        activity,
        width: canvas.width,
        height: canvas.height,
        dpr,
        cell,
        time: seconds,
        drift: [DRIFT[0] * seconds, DRIFT[1] * seconds],
        color,
        accent,
        waves,
        trail,
      });
    };

    drawRef.current = draw;
    resize();
    draw(timeRef.current);
    const observer = new ResizeObserver(() => {
      resize();
      draw(timeRef.current);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      drawRef.current = () => {};
    };
  }, []);

  React.useEffect(() => {
    drawRef.current(timeRef.current);
  }, [glowColor, shapeColor, fontSize]);

  React.useEffect(() => {
    if (!playing) return;
    const tick = ({ delta }: { delta: number }) => {
      timeRef.current += Math.min(delta, 64);
      drawRef.current(timeRef.current, true);
    };
    frame.render(tick, true);
    return () => cancelFrame(tick);
  }, [playing]);

  const point = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <div
      ref={containerRef}
      data-slot="glyph-background"
      className={cn('relative size-full overflow-hidden', className)}
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        const now = timeRef.current;
        const trail = trailRef.current;
        const last = trail[trail.length - 1];
        const energy = activityRef.current;
        const current =
          energy.value *
          Math.exp(-Math.max(0, now - energy.at) / ACTIVITY_DECAY);
        activityRef.current = {
          value: Math.min(
            1,
            current + (last ? Math.hypot(x - last.x, y - last.y) : 0) / 600,
          ),
          at: now,
        };
        if (last && Math.hypot(x - last.x, y - last.y) < 18) return;
        trailRef.current = [
          ...trail.filter((p) => now - p.t < TRAIL_LIFE).slice(1 - TRAIL),
          { x, y, t: now },
        ];
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!interactive || reduce) return;
        const { x, y } = point(event);
        spawn(x, y);
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      {children}
    </div>
  );
}

function GlyphBackground(props: GlyphBackgroundProps) {
  return (
    <ReducedMotionConfig>
      <GlyphBackgroundContent {...props} />
    </ReducedMotionConfig>
  );
}

export { GlyphBackground, type GlyphBackgroundProps };
