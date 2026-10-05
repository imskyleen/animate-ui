'use client';

import {
  type Frame,
  type Frames,
  MotionGrid,
  MotionGridCells,
} from '@/registry/primitives/animate/motion-grid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/components/animate/tooltip';
import { Trash2Icon } from '@/registry/icons/trash-2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/radix/dropdown-menu';
import { Button } from '@workspace/ui/components/ui/button';
import { Input } from '@workspace/ui/components/ui/input';
import { Label } from '@workspace/ui/components/ui/label';
import { ScrollArea } from '@workspace/ui/components/ui/scroll-area';
import { cn } from '@workspace/ui/lib/utils';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  CheckIcon,
  XIcon,
  Timer,
  SquareRoundCorner,
} from 'lucide-react';
import * as React from 'react';

const GRID_SIZE = [7, 7] as [number, number];
const GRID_SIZE_MAX = 20;
const GRID_SIZE_MIN = 4;
const DEFAULT_DURATION = '200';
const DEFAULT_BORDER_RADIUS = '100';
const DEFAULT_BORDER_RADIUS_UNIT = '%';
const BORDER_RADIUS_UNITS = ['px', 'rem', 'em', '%'];

const formatGridSizeNumber = (value: number) => {
  if (value < GRID_SIZE_MIN) return GRID_SIZE_MIN;
  if (value > GRID_SIZE_MAX) return GRID_SIZE_MAX;
  return Math.round(value);
};

const MyAnimation = ({
  name,
  value,
  selectAnimation,
  deleteAnimation,
  active,
}: {
  name: string;
  value: {
    gridSize: [number, number];
    frames: Frames;
    duration: string;
    borderRadius: string;
    borderRadiusUnit: string;
  };
  selectAnimation: () => void;
  deleteAnimation: () => void;
  active: boolean;
}) => {
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isHovering, setIsHovering] = React.useState<boolean>(false);

  return (
    <div
      onClick={selectAnimation}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'group flex flex-row gap-3 items-center hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-xl p-2',
        active && 'bg-neutral-100 dark:bg-neutral-900',
      )}
    >
      <div className="flex size-20 shrink-0 aspect-square justify-center items-center">
        <MotionGrid
          className={cn(
            'dark:bg-neutral-900 bg-neutral-100 group-hover:ring-2 group-hover:ring-neutral-200 dark:group-hover:ring-neutral-800 rounded-md p-1.5',
            active && 'ring-2 ring-neutral-300 dark:ring-neutral-700',
            value.gridSize[0] > value.gridSize[1]
              ? 'w-20 h-auto'
              : 'h-20 w-auto',
            Math.max(value.gridSize[0], value.gridSize[1]) > 10
              ? 'gap-px'
              : 'gap-0.5',
          )}
          duration={Number(value.duration)}
          animate={isHovering}
          gridSize={value.gridSize}
          frames={value.frames}
        >
          <MotionGridCells
            style={{
              borderRadius: `${value.borderRadius}${value.borderRadiusUnit}`,
            }}
            activeProps={{
              className: 'bg-neutral-800 dark:bg-neutral-200',
            }}
            inactiveProps={{
              className: 'bg-neutral-200 dark:bg-neutral-800',
            }}
            className="size-full rounded-full aspect-square"
          />
        </MotionGrid>
      </div>

      <div className="flex flex-row gap-2 justify-between items-center w-full">
        <div className="flex flex-col gap-1 text-left">
          <Label className="text-sm">{name}</Label>
          <p className="text-xs text-neutral-500 mt-0 mb-0">
            {value.gridSize[0]}x{value.gridSize[1]} • {value.frames.length}{' '}
            frames
          </p>
        </div>

        {isDeleting ? (
          <div className="flex flex-row gap-2">
            <Button
              size="icon-xs"
              variant="neutral"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleting(false);
              }}
            >
              <XIcon />
            </Button>
            <Button
              size="icon-xs"
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteAnimation();
                setIsDeleting(false);
              }}
            >
              <CheckIcon />
            </Button>
          </div>
        ) : (
          <Button
            size="icon-xs"
            variant="neutral"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDeleting(true);
            }}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
    </div>
  );
};

interface Animation {
  gridSize: [number, number];
  frames: Frames;
  duration: string;
  borderRadius: string;
  borderRadiusUnit: string;
}

export const MotionGridEditor = () => {
  const [gridSizeInput, setGridSizeInput] = React.useState<[string, string]>(
    GRID_SIZE.map((n) => n.toString()) as [string, string],
  );
  const [gridSize, setGridSize] = React.useState<[number, number]>(GRID_SIZE);
  const [frames, setFrames] = React.useState<Frames>([[]]);
  const [activeFrame, setActiveFrame] = React.useState<number>(0);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [isSaved, setIsSaved] = React.useState<boolean>(false);
  const [animationName, setAnimationName] = React.useState<string>('');
  const [selectedAnimation, setSelectedAnimation] = React.useState<
    string | null
  >(null);
  const [animations, setAnimations] = React.useState<Record<string, Animation>>(
    {},
  );
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawAction, setDrawAction] = React.useState<'add' | 'remove' | null>(
    null,
  );
  const [duration, setDuration] = React.useState<string>(DEFAULT_DURATION);
  const [borderRadius, setBorderRadius] = React.useState<string>(
    DEFAULT_BORDER_RADIUS,
  );
  const [borderRadiusUnit, setBorderRadiusUnit] = React.useState<string>('px');

  React.useEffect(() => {
    const handleUp = () => {
      setIsDrawing(false);
      setDrawAction(null);
    };

    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  const normalizeAnimation = (anim: Partial<Animation>): Animation =>
    ({
      ...anim,
      duration: anim.duration ?? DEFAULT_DURATION,
      borderRadius: anim.borderRadius ?? DEFAULT_BORDER_RADIUS,
      borderRadiusUnit: anim.borderRadiusUnit ?? DEFAULT_BORDER_RADIUS_UNIT,
    }) as Animation;

  React.useEffect(() => {
    const raw = localStorage.getItem('animations');
    const parsed: Record<string, Partial<Animation>> = raw
      ? JSON.parse(raw)
      : {};

    const fixed: Record<string, Animation> = Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key,
        normalizeAnimation(value),
      ]),
    );

    setAnimations(fixed);

    localStorage.setItem('animations', JSON.stringify(fixed));
  }, []);

  const activeFrameDots = new Set<number>(
    frames[activeFrame]?.map(([x, y]) => y * gridSize[0]! + x) ?? [],
  );

  const applyDot = (x: number, y: number, action: 'add' | 'remove') => {
    setFrames((prev) => {
      const clone = [...prev];
      const current = clone[activeFrame]!;
      const idx = current.findIndex(([px, py]) => px === x && py === y);

      if (action === 'add' && idx === -1) {
        clone[activeFrame] = [...current, [x, y]];
      } else if (action === 'remove' && idx !== -1) {
        clone[activeFrame] = [
          ...current.slice(0, idx),
          ...current.slice(idx + 1),
        ];
      }
      return clone;
    });
  };

  const moveCurrentFrame = (direction: -1 | 1) => {
    if (frames.length <= 1) return;

    setFrames((prev) => {
      const clone = [...prev];
      const len = clone.length;
      const newIndex = (activeFrame + direction + len) % len;

      const [moved] = clone.splice(activeFrame, 1);
      clone.splice(newIndex, 0, moved!);

      setActiveFrame(newIndex);
      return clone;
    });
  };

  const removeDotNotInGrid = () => {
    setFrames((prev) =>
      prev.map((frame) =>
        frame.filter(([x, y]) => x < gridSize[0] && y < gridSize[1]),
      ),
    );
  };

  const createNewAnimation = () => {
    setGridSize(GRID_SIZE);
    setGridSizeInput(GRID_SIZE.map((n) => n.toString()) as [string, string]);
    setDuration(DEFAULT_DURATION);
    setBorderRadius(DEFAULT_BORDER_RADIUS);
    setBorderRadiusUnit(DEFAULT_BORDER_RADIUS_UNIT);
    setFrames([[]]);
    setActiveFrame(0);
    setAnimationName('');
    setIsSaved(false);
    setIsCopied(false);
    setSelectedAnimation(null);
  };

  return (
    <div className="grid grid-cols-12 gap-4 lg:h-[506px]">
      <div className="lg:col-span-5 col-span-12 border rounded-xl overflow-hidden flex flex-col min-h-0 h-[506px]">
        <div className="relative flex flex-row p-4 bg-muted border-b border-border/75 dark:border-border/50">
          <Label>My Animations</Label>
          <Button
            size="icon-xs"
            variant="neutral"
            className="absolute top-1/2 -translate-y-1/2 right-2"
            onClick={createNewAnimation}
          >
            <PlusIcon />
          </Button>
        </div>
        <div className="flex-1 flex flex-col gap-y-2 justify-between overflow-y-auto p-2">
          <div className="flex flex-col gap-y-2">
            {Object.entries(animations).map(([name, value]) => (
              <MyAnimation
                key={name}
                name={name}
                value={value}
                selectAnimation={() => {
                  setGridSize(value.gridSize);
                  setFrames(value.frames);
                  setDuration(value.duration);
                  setBorderRadius(value.borderRadius);
                  setBorderRadiusUnit(value.borderRadiusUnit);
                  setActiveFrame(0);
                  setAnimationName(name);
                  setIsSaved(false);
                  setIsCopied(false);
                  setGridSizeInput(
                    value.gridSize.map((n) => n.toString()) as [string, string],
                  );
                  setSelectedAnimation(name);
                }}
                deleteAnimation={() => {
                  if (selectedAnimation === name) createNewAnimation();
                  const newAnimations = { ...animations };
                  delete newAnimations[name];
                  setAnimations(newAnimations);
                  localStorage.setItem(
                    'animations',
                    JSON.stringify(newAnimations),
                  );
                }}
                active={selectedAnimation === name}
              />
            ))}
          </div>

          <span className="text-xs text-neutral-400 dark:text-neutral-600 text-center italic">
            Animations stored in local storage
          </span>
        </div>
      </div>
      <div className="lg:col-span-7 col-span-12 border rounded-xl overflow-hidden">
        <div className="relative flex flex-row justify-between items-center gap-2 p-4 bg-muted border-b border-border/75 dark:border-border/50">
          <Label className="whitespace-nowrap">
            {selectedAnimation ? 'Edit Animation' : 'Create New Animation'}
          </Label>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-row gap-1 items-center">
            <Input
              placeholder="X"
              type="number"
              className="border-none h-8 text-sm max-w-8 p-0 bg-white text-center dark:bg-neutral-900 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={gridSizeInput[0]}
              onChange={(e) => {
                setGridSizeInput((prev) => [e.target.value, prev[1]]);
                setGridSize((prev) => [
                  formatGridSizeNumber(Number(e.target.value)),
                  prev[1],
                ]);
              }}
              onBlur={() => {
                setGridSizeInput(
                  gridSize.map((n) => n.toString()) as [string, string],
                );
                removeDotNotInGrid();
              }}
            />
            <XIcon className="size-3 text-neutral-500 stroke-3" />
            <Input
              placeholder="Y"
              type="number"
              className="border-none h-8 text-sm max-w-8 p-0 bg-white text-center dark:bg-neutral-900 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={gridSizeInput[1]}
              onChange={(e) => {
                setGridSizeInput((prev) => [prev[0], e.target.value]);
                setGridSize((prev) => [
                  prev[0],
                  formatGridSizeNumber(Number(e.target.value)),
                ]);
              }}
              onBlur={() => {
                setGridSizeInput(
                  gridSize.map((n) => n.toString()) as [string, string],
                );
                removeDotNotInGrid();
              }}
            />
          </div>
        </div>

        <div>
          <div className="p-4 relative">
            <div className="flex size-20 shrink-0 aspect-square justify-end items-start absolute right-4 top-4">
              <MotionGrid
                className={cn(
                  'size-full dark:bg-neutral-900 bg-neutral-100 rounded-md p-1.5',
                  gridSize[0] > gridSize[1] ? 'w-20 h-auto' : 'h-20 w-auto',
                  Math.max(gridSize[0], gridSize[1]) > 10
                    ? 'gap-px'
                    : 'gap-0.5',
                )}
                duration={Number(duration)}
                gridSize={gridSize}
                frames={frames}
              >
                <MotionGridCells
                  style={{
                    borderRadius: `${borderRadius}${borderRadiusUnit}`,
                  }}
                  activeProps={{
                    className: 'bg-neutral-800 dark:bg-neutral-200',
                  }}
                  inactiveProps={{
                    className: 'bg-neutral-200 dark:bg-neutral-800',
                  }}
                  className="size-full rounded-full aspect-square"
                />
              </MotionGrid>
            </div>

            <div className="max-w-[150px] sm:max-w-[200px] flex items-center justify-center aspect-square mx-auto">
              <div
                className={cn(
                  'grid w-fit p-3 dark:bg-neutral-900 bg-neutral-100 rounded-xl',
                  gridSize[0] > gridSize[1]
                    ? 'w-[150px] sm:w-[200px]'
                    : 'h-[150px] sm:h-[200px]',
                  Math.max(gridSize[0], gridSize[1]) > 10
                    ? 'gap-0.5'
                    : Math.max(gridSize[0], gridSize[1]) > 10
                      ? 'gap-1'
                      : 'gap-1.5',
                )}
                style={{
                  gridTemplateColumns: `repeat(${gridSize[0]}, minmax(0, 1fr))`,
                  gridAutoRows: '1fr',
                }}
              >
                {Array.from({ length: gridSize[0]! * gridSize[1]! }).map(
                  (_, i) => (
                    <div
                      key={i}
                      onMouseDown={() => {
                        const x = i % gridSize[0]!;
                        const y = Math.floor(i / gridSize[0]!);
                        const action: 'add' | 'remove' = activeFrameDots.has(i)
                          ? 'remove'
                          : 'add';

                        setDrawAction(action);
                        setIsDrawing(true);
                        applyDot(x, y, action);
                      }}
                      onMouseEnter={() => {
                        if (!isDrawing || !drawAction) return;
                        const x = i % gridSize[0]!;
                        const y = Math.floor(i / gridSize[0]!);
                        applyDot(x, y, drawAction);
                      }}
                      className={cn(
                        'rounded-full aspect-square hover:ring hover:ring-neutral-300 dark:hover:ring-neutral-700',
                        activeFrameDots.has(i)
                          ? 'bg-neutral-800 dark:bg-neutral-200'
                          : 'bg-neutral-200 dark:bg-neutral-800',
                      )}
                      style={{
                        borderRadius: `${borderRadius}${borderRadiusUnit}`,
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div className="p-4 space-y-4 pt-0">
              <div className="h-20 w-full flex flex-row items-center gap-2">
                <ScrollArea className="w-full h-full flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-x-auto">
                  <div className="w-max p-2 h-full">
                    <div className="flex h-full flex-row gap-2 items-center">
                      {frames.map((_, index) => {
                        const activeDot = new Set<number>(
                          frames[index]?.map(
                            ([x, y]) => y * gridSize[0]! + x,
                          ) ?? [],
                        );

                        return (
                          <button
                            key={index}
                            className={cn(
                              'h-full cursor-pointer shrink-0 bg-background rounded-lg',
                              activeFrame === index
                                ? 'ring-2 ring-neutral-300 dark:ring-neutral-700'
                                : '',
                            )}
                            onClick={() => setActiveFrame(index)}
                          >
                            <div
                              className={cn(
                                'grid p-[5px] h-full',
                                Math.max(gridSize[0], gridSize[1]) > 10
                                  ? 'gap-[0.5px]'
                                  : Math.max(gridSize[0], gridSize[1]) > 10
                                    ? 'gap-px'
                                    : 'gap-[1.5px]',
                              )}
                              style={{
                                gridTemplateColumns: `repeat(${gridSize[0]}, minmax(0, 1fr))`,
                              }}
                            >
                              {Array.from({
                                length: gridSize[0]! * gridSize[1]!,
                              }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'bg-neutral-200 dark:bg-neutral-800 aspect-square w-full',
                                    activeDot.has(i)
                                      ? 'bg-neutral-800 dark:bg-neutral-200'
                                      : 'bg-neutral-200 dark:bg-neutral-800',
                                  )}
                                  style={{
                                    borderRadius: `${borderRadius}${borderRadiusUnit}`,
                                  }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>

                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        onClick={() => {
                          setFrames((prev) => {
                            const currentIndex = activeFrame;
                            const currentFrame = prev[currentIndex] ?? [];
                            const newFrame: Frame = currentFrame.map(
                              ([x, y]) => [x, y],
                            );
                            const updatedFrames = [...prev];
                            updatedFrames.splice(currentIndex + 1, 0, newFrame);
                            setActiveFrame(currentIndex + 1);
                            return updatedFrames;
                          });
                        }}
                      >
                        <PlusIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Frame</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        disabled={frames.length <= 1}
                        onClick={() => {
                          if (frames.length <= 1) return;
                          setFrames((prev) => {
                            const newFrames = prev.filter(
                              (_, i) => i !== activeFrame,
                            );
                            setActiveFrame(
                              newFrames.length - 1 > 0
                                ? newFrames.length - 1
                                : 0,
                            );
                            return newFrames;
                          });
                        }}
                      >
                        <Trash2Icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove Frame</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        className="h-8"
                        variant="neutral"
                        disabled={frames.length <= 1}
                        onClick={() => moveCurrentFrame(-1)}
                      >
                        <ArrowLeftIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move Frame Left</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        className="h-8"
                        variant="neutral"
                        disabled={frames.length <= 1}
                        onClick={() => moveCurrentFrame(1)}
                      >
                        <ArrowRightIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move Frame Right</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="h-10 flex flex-row gap-4 items-center">
                <div className="relative flex-1 h-full bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <div className="absolute inset-y-0 left-0 h-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-l-lg flex items-center justify-center">
                    <Timer className="size-5 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <Input
                    type="number"
                    className="size-full px-13 border-none bg-transparent shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={duration}
                    placeholder="Duration"
                    step={10}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') {
                        setDuration('');
                        return;
                      }
                      const n = Number(v);
                      if (!Number.isNaN(n) && n >= 0) {
                        setDuration(v);
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 h-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-r-lg flex items-center justify-center">
                    <span className="text-neutral-400 dark:text-neutral-600 text-sm">
                      ms
                    </span>
                  </div>
                </div>
                <div className="relative flex-1 h-full bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <div className="absolute inset-y-0 left-0 h-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-l-lg flex items-center justify-center">
                    <SquareRoundCorner className="size-5 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <Input
                    type="number"
                    className="size-full px-13 border-none bg-transparent shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={borderRadius}
                    placeholder="Border Radius"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') {
                        setBorderRadius('');
                        return;
                      }
                      const n = Number(v);
                      if (!Number.isNaN(n) && n >= 0) {
                        setBorderRadius(v);
                      }
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="absolute inset-y-0 right-0 h-full aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-r-lg flex items-center justify-center">
                        <button className="text-neutral-400 dark:text-neutral-600 text-sm">
                          {borderRadiusUnit}
                        </button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {BORDER_RADIUS_UNITS.map((unit) => (
                        <DropdownMenuItem
                          key={unit}
                          onClick={() => setBorderRadiusUnit(unit)}
                        >
                          {unit}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="flex p-4 flex-row gap-2 border-t">
              <Input
                required
                placeholder="Animation Name"
                className="border-none bg-neutral-100 dark:bg-neutral-900 shadow-none"
                value={animationName}
                onChange={(e) => setAnimationName(e.target.value)}
              />

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="neutral"
                    size="icon"
                    onClick={() => setFrames([[]])}
                  >
                    <RotateCcwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Animation</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="neutral"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(frames));
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 2000);
                    }}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCopied ? 'Copied' : 'Copy Animation'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="icon"
                    disabled={!animationName.trim()}
                    onClick={() => {
                      if (!animationName.trim())
                        return alert('Please enter a name');

                      const nameAlreadyExists = selectedAnimation
                        ? animationName !== selectedAnimation &&
                          animations[animationName]
                        : Boolean(animations[animationName]);

                      if (nameAlreadyExists) {
                        return alert('Animation with this name already exists');
                      }

                      const newAnimations = { ...animations };

                      if (selectedAnimation) {
                        if (selectedAnimation !== animationName) {
                          delete newAnimations[selectedAnimation];
                        }
                      }

                      newAnimations[animationName] = {
                        gridSize,
                        frames,
                        duration,
                        borderRadius,
                        borderRadiusUnit,
                      };

                      setAnimations(newAnimations);
                      setSelectedAnimation(animationName);
                      localStorage.setItem(
                        'animations',
                        JSON.stringify(newAnimations),
                      );

                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                  >
                    {isSaved ? <CheckIcon /> : <SaveIcon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Animation</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
