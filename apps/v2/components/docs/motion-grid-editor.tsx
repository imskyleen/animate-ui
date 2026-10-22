'use client';

import {
  MotionGrid,
  MotionGridCells,
  type Frame,
  type Frames,
} from '@animate-ui/react/primitives/motion-grid';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  ReactIcon,
  RotateCcwIcon,
  SquareRoundCornerIcon,
  Tick02Icon,
  Timer02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { cn } from 'cn';
import type { HTMLMotionProps } from 'motion/react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { DynamicCodeBlock } from './dynamic-codeblock';
import { IconSwap } from './icon-swap';
import { VueDemo } from './vue-demo';
import { VueLogo } from './vue-logo';

type Framework = 'react' | 'vue';

type Animation = {
  gridSize: [number, number];
  frames: Frames;
  duration: string;
  borderRadius: string;
  borderRadiusUnit: string;
};

const STORAGE_KEY = 'animate-ui:motion-grid-animations';
const GRID_SIZE: [number, number] = [7, 7];
const GRID_SIZE_MIN = 4;
const GRID_SIZE_MAX = 20;
const DEFAULT_DURATION = '200';
const DEFAULT_BORDER_RADIUS = '100';
const DEFAULT_BORDER_RADIUS_UNIT = '%';
const BORDER_RADIUS_UNITS = ['px', 'rem', 'em', '%'];

const ACTIVE = 'bg-foreground';
const INACTIVE = 'bg-foreground/15';
const NUMBER_INPUT =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const clampGridSize = (value: number) =>
  Math.min(GRID_SIZE_MAX, Math.max(GRID_SIZE_MIN, Math.round(value) || 0));

const radiusOf = (
  animation: Pick<Animation, 'borderRadius' | 'borderRadiusUnit'>,
) => `${animation.borderRadius || 0}${animation.borderRadiusUnit}`;

const dotsOf = (frame: Frame | undefined, cols: number) =>
  new Set(frame?.map(([x, y]) => y * cols + x));

function readAnimations(): Record<string, Animation> {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    ) as Record<string, Partial<Animation>>;
    return Object.fromEntries(
      Object.entries(parsed).map(([name, animation]) => [
        name,
        {
          gridSize: animation.gridSize ?? GRID_SIZE,
          frames: animation.frames ?? [[]],
          duration: animation.duration ?? DEFAULT_DURATION,
          borderRadius: animation.borderRadius ?? DEFAULT_BORDER_RADIUS,
          borderRadiusUnit:
            animation.borderRadiusUnit ?? DEFAULT_BORDER_RADIUS_UNIT,
        },
      ]),
    );
  } catch {
    return {};
  }
}

function writeAnimations(animations: Record<string, Animation>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animations));
  } catch {
    // Storage can be blocked, the editor still works.
  }
}

function radiusClass({
  borderRadius,
  borderRadiusUnit,
}: Pick<Animation, 'borderRadius' | 'borderRadiusUnit'>) {
  const value = Number(borderRadius) || 0;
  if (value === 0) return 'rounded-none';
  if (borderRadiusUnit === '%' && value >= 50) return 'rounded-full';
  return `rounded-[${value}${borderRadiusUnit}]`;
}

function framesCode(frames: Frames) {
  const lines = frames.map(
    (frame) => `  [${frame.map(([x, y]) => `[${x}, ${y}]`).join(', ')}],`,
  );
  return `[\n${lines.join('\n')}\n]`;
}

function generateCode(framework: Framework, animation: Animation) {
  const [cols, rows] = animation.gridSize;
  const duration = Number(animation.duration) || 0;
  const cells = `size-1 ${radiusClass(animation)} bg-foreground/20 data-[active=true]:bg-foreground`;

  if (framework === 'vue')
    return `<script setup lang="ts">
import type { Frames } from '@animate-ui/vue/primitives/motion-grid';
import { MotionGrid, MotionGridCells } from '@animate-ui/vue/primitives/motion-grid';

const frames: Frames = ${framesCode(animation.frames)};
</script>

<template>
  <MotionGrid :grid-size="[${cols}, ${rows}]" :frames="frames"${duration === 200 ? '' : ` :duration="${duration}"`} class="gap-0.5">
    <MotionGridCells class="${cells}" />
  </MotionGrid>
</template>`;

  return `import {
  MotionGrid,
  MotionGridCells,
  type Frames,
} from '@animate-ui/react/primitives/motion-grid';

const frames: Frames = ${framesCode(animation.frames)};

export function Loader() {
  return (
    <MotionGrid gridSize={[${cols}, ${rows}]} frames={frames}${duration === 200 ? '' : ` duration={${duration}}`} className="gap-0.5">
      <MotionGridCells className="${cells}" />
    </MotionGrid>
  );
}`;
}

function GridPreview({
  framework,
  animation,
  animate = true,
  className,
}: {
  framework: Framework;
  animation: Animation;
  animate?: boolean;
  className?: string;
}) {
  const [cols, rows] = animation.gridSize;
  const gridClassName = cn(
    'rounded-md bg-muted p-1.5',
    cols > rows ? 'h-auto w-20' : 'h-20 w-auto',
    Math.max(cols, rows) > 10 ? 'gap-px' : 'gap-0.5',
    className,
  );
  const radius = radiusOf(animation);
  const duration = Number(animation.duration) || 1;

  if (framework === 'vue')
    return (
      <VueDemo
        name="docs/motion-grid-preview"
        gridSize={animation.gridSize}
        frames={animation.frames}
        duration={duration}
        animate={animate}
        radius={radius}
        gridClass={gridClassName}
      />
    );

  return (
    <MotionGrid
      gridSize={animation.gridSize}
      frames={animation.frames}
      duration={duration}
      animate={animate}
      className={gridClassName}
    >
      <MotionGridCells
        style={{ borderRadius: radius }}
        className="aspect-square size-full bg-foreground/15 data-[active=true]:bg-foreground"
      />
    </MotionGrid>
  );
}

const iconButton = {
  neutral: 'bg-accent text-muted-foreground hover:text-foreground',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/85',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
} as const;

function IconButton({
  label,
  icon,
  variant = 'neutral',
  size = 'md',
  tooltip = true,
  className,
  children,
  ...props
}: Omit<HTMLMotionProps<'button'>, 'children'> & {
  label: string;
  icon?: IconSvgElement;
  variant?: keyof typeof iconButton;
  size?: 'sm' | 'md';
  tooltip?: boolean;
  children?: ReactNode;
}) {
  const button = (
    <Button
      type="button"
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'size-7' : 'size-8',
        iconButton[variant],
        className,
      )}
      {...props}
    >
      {children ??
        (icon && (
          <HugeiconsIcon
            icon={icon}
            strokeWidth={2}
            size={size === 'sm' ? 14 : 16}
          />
        ))}
    </Button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

function SavedAnimation({
  framework,
  name,
  animation,
  active,
  onSelect,
  onDelete,
}: {
  framework: Framework;
  name: string;
  animation: Animation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [hovering, setHovering] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="motion-grid-editor-animation"
      data-active={active}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50',
        active && 'bg-accent',
      )}
    >
      <div className="flex size-20 shrink-0 items-center justify-center">
        <GridPreview
          framework={framework}
          animation={animation}
          animate={hovering}
          className={cn(
            'group-hover:ring-2 group-hover:ring-border',
            active && 'ring-2 ring-ring/40',
          )}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">
            {animation.gridSize[0]}x{animation.gridSize[1]} •{' '}
            {animation.frames.length} frames
          </span>
        </div>

        <div
          className="flex gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          {deleting ? (
            <>
              <IconButton
                label="Cancel"
                icon={Cancel01Icon}
                size="sm"
                tooltip={false}
                onClick={() => setDeleting(false)}
              />
              <IconButton
                label="Confirm delete"
                icon={Tick02Icon}
                variant="destructive"
                size="sm"
                tooltip={false}
                onClick={() => {
                  setDeleting(false);
                  onDelete();
                }}
              />
            </>
          ) : (
            <IconButton
              label="Delete animation"
              icon={Delete02Icon}
              size="sm"
              tooltip={false}
              onClick={() => setDeleting(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  suffix,
  children,
}: {
  icon: IconSvgElement;
  suffix: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-10 w-full min-w-0 items-stretch sm:flex-1 overflow-hidden rounded-lg bg-muted">
      <div className="flex aspect-square items-center justify-center bg-foreground/5 text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} size={18} />
      </div>
      {children}
      {suffix}
    </div>
  );
}

const fieldInput = cn(
  'min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground',
  NUMBER_INPUT,
);

export function MotionGridEditor({
  framework = 'react',
}: {
  framework?: Framework;
}) {
  const [gridSizeInput, setGridSizeInput] = useState<[string, string]>([
    String(GRID_SIZE[0]),
    String(GRID_SIZE[1]),
  ]);
  const [gridSize, setGridSize] = useState<[number, number]>(GRID_SIZE);
  const [frames, setFrames] = useState<Frames>([[]]);
  const [activeFrame, setActiveFrame] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [animationName, setAnimationName] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(
    null,
  );
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [borderRadius, setBorderRadius] = useState(DEFAULT_BORDER_RADIUS);
  const [borderRadiusUnit, setBorderRadiusUnit] = useState(
    DEFAULT_BORDER_RADIUS_UNIT,
  );
  const drawActionRef = useRef<'add' | 'remove' | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const stop = () => {
      drawActionRef.current = null;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      clearTimeout(copiedTimeoutRef.current);
      clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const stored = readAnimations();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    setAnimations(stored);
    writeAnimations(stored);
  }, []);

  const animation: Animation = {
    gridSize,
    frames,
    duration,
    borderRadius,
    borderRadiusUnit,
  };
  const [cols, rows] = gridSize;
  const radius = radiusOf(animation);
  const activeDots = dotsOf(frames[activeFrame], cols);
  const nameTaken =
    animationName !== selectedAnimation && animationName in animations;

  const applyDot = (x: number, y: number, action: 'add' | 'remove') => {
    setFrames((prev) => {
      const next = [...prev];
      const current = next[activeFrame] ?? [];
      const index = current.findIndex(([px, py]) => px === x && py === y);
      if (action === 'add' && index === -1)
        next[activeFrame] = [...current, [x, y]];
      else if (action === 'remove' && index !== -1)
        next[activeFrame] = current.filter((_, i) => i !== index);
      else return prev;
      return next;
    });
  };

  const cellAt = (event: PointerEvent) => {
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-slot="motion-grid-editor-cell"]');
    const index = Number(target?.dataset.index);
    return Number.isNaN(index) || !target ? null : index;
  };

  const moveFrame = (direction: -1 | 1) => {
    if (frames.length <= 1) return;
    const index = (activeFrame + direction + frames.length) % frames.length;
    setFrames((prev) => {
      const next = [...prev];
      const [moved] = next.splice(activeFrame, 1);
      next.splice(index, 0, moved!);
      return next;
    });
    setActiveFrame(index);
  };

  const commitGridSize = () => {
    setGridSizeInput([String(cols), String(rows)]);
    setFrames((prev) =>
      prev.map((frame) => frame.filter(([x, y]) => x < cols && y < rows)),
    );
  };

  const load = (name: string | null, next: Animation) => {
    setGridSize(next.gridSize);
    setGridSizeInput([String(next.gridSize[0]), String(next.gridSize[1])]);
    setFrames(next.frames);
    setDuration(next.duration);
    setBorderRadius(next.borderRadius);
    setBorderRadiusUnit(next.borderRadiusUnit);
    setActiveFrame(0);
    setAnimationName(name ?? '');
    setSelectedAnimation(name);
    setSaved(false);
    setCopied(false);
  };

  const createNew = () =>
    load(null, {
      gridSize: GRID_SIZE,
      frames: [[]],
      duration: DEFAULT_DURATION,
      borderRadius: DEFAULT_BORDER_RADIUS,
      borderRadiusUnit: DEFAULT_BORDER_RADIUS_UNIT,
    });

  const save = () => {
    const name = animationName.trim();
    if (!name || nameTaken) return;
    const next = { ...animations };
    if (selectedAnimation && selectedAnimation !== name)
      delete next[selectedAnimation];
    next[name] = animation;
    setAnimations(next);
    setAnimationName(name);
    setSelectedAnimation(name);
    writeAnimations(next);
    setSaved(true);
    clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const numberChange =
    (set: (value: string) => void) =>
    (event: { target: { value: string } }) => {
      const value = event.target.value;
      if (value === '' || Number(value) >= 0) set(value);
    };

  const sizeInput = (axis: 0 | 1) => (
    <input
      type="number"
      aria-label={axis === 0 ? 'Columns' : 'Rows'}
      placeholder={axis === 0 ? 'X' : 'Y'}
      min={GRID_SIZE_MIN}
      max={GRID_SIZE_MAX}
      value={gridSizeInput[axis]}
      onChange={(event) => {
        const value = event.target.value;
        setGridSizeInput((prev) =>
          axis === 0 ? [value, prev[1]] : [prev[0], value],
        );
        setGridSize((prev) =>
          axis === 0
            ? [clampGridSize(Number(value)), prev[1]]
            : [prev[0], clampGridSize(Number(value))],
        );
      }}
      onBlur={commitGridSize}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className={cn(
        'h-7 w-8 rounded-md bg-background text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        NUMBER_INPUT,
      )}
    />
  );

  return (
    <TooltipProvider>
      <div
        data-slot="motion-grid-editor"
        data-framework={framework}
        className="not-prose @container my-6 flex flex-col gap-1 rounded-xl bg-accent p-1 text-foreground"
      >
        <div className="grid grid-cols-1 gap-1 @2xl:grid-cols-12">
          <div className="flex max-h-[506px] min-h-0 flex-col overflow-hidden rounded-lg bg-background @2xl:col-span-5 @2xl:h-0 @2xl:max-h-none @2xl:min-h-full">
            <div className="flex h-12 items-center justify-between border-b px-4 pr-2">
              <span className="text-sm font-medium">My Animations</span>
              <IconButton
                label="New animation"
                icon={Add01Icon}
                size="sm"
                onClick={createNew}
              />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2 overflow-y-auto p-2">
              <div className="flex flex-col gap-1">
                {Object.entries(animations).map(([name, value]) => (
                  <SavedAnimation
                    key={name}
                    framework={framework}
                    name={name}
                    animation={value}
                    active={selectedAnimation === name}
                    onSelect={() => load(name, value)}
                    onDelete={() => {
                      if (selectedAnimation === name) createNew();
                      const next = { ...animations };
                      delete next[name];
                      setAnimations(next);
                      writeAnimations(next);
                    }}
                  />
                ))}
              </div>
              <span className="py-1 text-center text-xs text-muted-foreground italic">
                Animations stored in local storage
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col overflow-hidden rounded-lg bg-background @2xl:col-span-7">
            <div className="flex h-12 items-center justify-between gap-2 border-b px-4 pr-2">
              <span className="truncate text-sm font-medium">
                {selectedAnimation ? 'Edit Animation' : 'Create New Animation'}
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                {sizeInput(0)}
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  size={12}
                  className="text-muted-foreground"
                />
                {sizeInput(1)}
              </div>
            </div>

            <div className="relative p-4">
              <div
                data-slot="motion-grid-editor-preview"
                className="absolute top-4 right-4 flex size-20 items-start justify-end"
              >
                <GridPreview framework={framework} animation={animation} />
              </div>

              <div className="mx-auto flex aspect-square max-w-[150px] items-center justify-center sm:max-w-[200px]">
                <div
                  data-slot="motion-grid-editor-grid"
                  className={cn(
                    'grid w-fit touch-none rounded-xl bg-muted p-3 select-none',
                    cols > rows
                      ? 'w-[150px] sm:w-[200px]'
                      : 'h-[150px] sm:h-[200px]',
                    Math.max(cols, rows) > 10 ? 'gap-0.5' : 'gap-1.5',
                  )}
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridAutoRows: '1fr',
                  }}
                  onPointerDown={(event) => {
                    const index = cellAt(event);
                    if (index === null) return;
                    event.preventDefault();
                    drawActionRef.current = activeDots.has(index)
                      ? 'remove'
                      : 'add';
                    applyDot(
                      index % cols,
                      Math.floor(index / cols),
                      drawActionRef.current,
                    );
                  }}
                  onPointerMove={(event) => {
                    if (!drawActionRef.current) return;
                    const index = cellAt(event);
                    if (index === null) return;
                    applyDot(
                      index % cols,
                      Math.floor(index / cols),
                      drawActionRef.current,
                    );
                  }}
                >
                  {Array.from({ length: cols * rows }, (_, i) => (
                    <div
                      key={i}
                      data-slot="motion-grid-editor-cell"
                      data-index={i}
                      data-active={activeDots.has(i)}
                      className={cn(
                        'aspect-square cursor-pointer hover:ring hover:ring-ring/40',
                        activeDots.has(i) ? ACTIVE : INACTIVE,
                      )}
                      style={{ borderRadius: radius }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 pt-0">
              <div className="flex h-20 items-center gap-2">
                <div className="h-full min-w-0 flex-1 overflow-x-auto rounded-2xl bg-muted">
                  <div className="flex h-full w-max items-center gap-2 p-2">
                    {frames.map((frame, index) => {
                      const dots = dotsOf(frame, cols);
                      return (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Frame ${index + 1}`}
                          aria-pressed={activeFrame === index}
                          data-slot="motion-grid-editor-frame"
                          onClick={() => setActiveFrame(index)}
                          className={cn(
                            'h-full shrink-0 cursor-pointer rounded-lg bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                            activeFrame === index && 'ring-2 ring-ring/40',
                          )}
                        >
                          <div
                            className={cn(
                              'grid h-full p-[5px]',
                              Math.max(cols, rows) > 10
                                ? 'gap-[0.5px]'
                                : 'gap-[1.5px]',
                            )}
                            style={{
                              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                            }}
                          >
                            {Array.from({ length: cols * rows }, (_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'aspect-square w-full',
                                  dots.has(i) ? ACTIVE : INACTIVE,
                                )}
                                style={{ borderRadius: radius }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <IconButton
                    label="Add Frame"
                    icon={Add01Icon}
                    variant="primary"
                    onClick={() => {
                      const next = [...frames];
                      next.splice(
                        activeFrame + 1,
                        0,
                        (frames[activeFrame] ?? []).map(([x, y]) => [x, y]),
                      );
                      setFrames(next);
                      setActiveFrame(activeFrame + 1);
                    }}
                  />
                  <IconButton
                    label="Remove Frame"
                    icon={Delete02Icon}
                    variant="destructive"
                    disabled={frames.length <= 1}
                    onClick={() => {
                      if (frames.length <= 1) return;
                      const next = frames.filter((_, i) => i !== activeFrame);
                      setFrames(next);
                      setActiveFrame(Math.max(0, next.length - 1));
                    }}
                  />
                  <IconButton
                    label="Move Frame Left"
                    icon={ArrowLeft02Icon}
                    disabled={frames.length <= 1}
                    onClick={() => moveFrame(-1)}
                  />
                  <IconButton
                    label="Move Frame Right"
                    icon={ArrowRight02Icon}
                    disabled={frames.length <= 1}
                    onClick={() => moveFrame(1)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Field
                  icon={Timer02Icon}
                  suffix={
                    <span className="flex aspect-square items-center justify-center bg-foreground/5 text-sm text-muted-foreground">
                      ms
                    </span>
                  }
                >
                  <input
                    type="number"
                    aria-label="Duration"
                    placeholder="Duration"
                    step={10}
                    min={0}
                    value={duration}
                    onChange={numberChange(setDuration)}
                    className={fieldInput}
                  />
                </Field>
                <Field
                  icon={SquareRoundCornerIcon}
                  suffix={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Border radius unit"
                          className="flex aspect-square cursor-pointer items-center justify-center bg-foreground/5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
                        >
                          {borderRadiusUnit}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-auto">
                        {BORDER_RADIUS_UNITS.map((unit) => (
                          <DropdownMenuItem
                            key={unit}
                            onSelect={() => setBorderRadiusUnit(unit)}
                          >
                            {unit}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                >
                  <input
                    type="number"
                    aria-label="Border radius"
                    placeholder="Border Radius"
                    min={0}
                    value={borderRadius}
                    onChange={numberChange(setBorderRadius)}
                    className={fieldInput}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-auto flex gap-2 border-t p-4">
              <input
                aria-label="Animation name"
                placeholder="Animation Name"
                aria-invalid={nameTaken || undefined}
                value={animationName}
                onChange={(event) => setAnimationName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save();
                }}
                className="h-8 min-w-0 flex-1 rounded-lg bg-muted px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-2 aria-invalid:ring-destructive/40"
              />
              <IconButton
                label="Reset Animation"
                icon={RotateCcwIcon}
                onClick={() => {
                  setFrames([[]]);
                  setActiveFrame(0);
                }}
              />
              <IconButton
                label={copied ? 'Copied' : 'Copy Animation'}
                onClick={() => {
                  void navigator.clipboard
                    .writeText(JSON.stringify(frames))
                    .then(() => {
                      setCopied(true);
                      clearTimeout(copiedTimeoutRef.current);
                      copiedTimeoutRef.current = setTimeout(
                        () => setCopied(false),
                        2000,
                      );
                    });
                }}
              >
                <IconSwap
                  active={copied}
                  icon={Copy01Icon}
                  activeIcon={Tick02Icon}
                  size={16}
                />
              </IconButton>
              <IconButton
                label={nameTaken ? 'Name already used' : 'Save Animation'}
                variant="primary"
                disabled={!animationName.trim() || nameTaken}
                onClick={save}
              >
                <IconSwap
                  active={saved}
                  icon={FloppyDiskIcon}
                  activeIcon={Tick02Icon}
                  size={16}
                />
              </IconButton>
            </div>
          </div>
        </div>

        <div
          data-slot="motion-grid-editor-code"
          className="overflow-hidden rounded-lg bg-background [&_figure]:my-0"
        >
          <DynamicCodeBlock
            code={generateCode(framework, animation)}
            lang={framework === 'vue' ? 'vue' : 'tsx'}
            codeblock={{
              className: 'my-0',
              title: framework === 'vue' ? 'loader.vue' : 'loader.tsx',
              icon:
                framework === 'vue' ? (
                  <VueLogo />
                ) : (
                  <HugeiconsIcon icon={ReactIcon} strokeWidth={2} />
                ),
              viewportClassName: 'max-h-[400px]',
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
