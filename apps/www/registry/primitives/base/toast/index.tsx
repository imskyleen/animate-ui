'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';

import { cn } from '@workspace/ui/lib/utils';

/**
 * Motion is CSS, not Motion: Base UI drives stacking, swipe-to-dismiss and
 * enter/exit itself through CSS variables (`--toast-index`,
 * `--toast-offset-y`, `--toast-swipe-movement-*`, `--toast-height`,
 * `--toast-frontmost-height`) and `data-starting-style` / `data-ending-style`,
 * so toasts animate with CSS transitions that read them. Transitions retarget
 * when toasts are added quickly; a JS animation layered on top would fight the
 * swipe and the stack.
 */

type ClassName<State> = string | ((state: State) => string | undefined);

function withClassName<State>(
  base: string,
  className: ClassName<State> | undefined,
): ClassName<State> {
  return typeof className === 'function'
    ? (state) => cn(base, className(state))
    : cn(base, className);
}

type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type ToastSide = 'top' | 'bottom';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

const ToastPositionContext = React.createContext<ToastPosition>('bottom-right');

function getSide(position: ToastPosition): ToastSide {
  return position.startsWith('top') ? 'top' : 'bottom';
}

// Swipe toward the edge the toast came from, and sideways toward the nearest
// screen edge (vertical only when centered).
function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const vertical: SwipeDirection = getSide(position) === 'top' ? 'up' : 'down';
  if (position.endsWith('left')) return [vertical, 'left'];
  if (position.endsWith('right')) return [vertical, 'right'];
  return [vertical];
}

// Root: stacked absolutely at the viewport edge. `--toast-dir` is 1 when the
// stack grows up from the bottom, -1 when it grows down from the top.
//
// Collapsed: each toast behind the front one scales down by 0.05 per step
// (never below 0.9) and peeks out by 0.75rem. Expanded (viewport hovered or
// focused): toasts spread out with a 0.75rem gap, full size.
//
// Enter and exit: one full toast height off the viewport edge (100% of its
// own height), so a toast leaves the way it came. A swipe dismissal continues
// in the swipe direction. `--toast-travel` drops to 0 under reduced motion:
// toasts fade in place and the stack changes without moving.
const ROOT_MOTION = [
  // Layout
  'absolute inset-x-0 bottom-0 z-[calc(1000_-_var(--toast-index))] origin-bottom select-none',
  'data-[side=top]:top-0 data-[side=top]:bottom-auto data-[side=top]:origin-top',
  // Stack geometry. While collapsed every toast takes the frontmost height.
  '[--toast-gap:0.75rem] [--toast-peek:0.75rem]',
  '[--toast-dir:1] data-[side=top]:[--toast-dir:-1]',
  '[--toast-scale:max(0.9,calc(1_-_var(--toast-index)*0.05))]',
  '[--toast-clamp:var(--toast-frontmost-height,var(--toast-height,0px))]',
  'h-[var(--toast-frontmost-height,var(--toast-height))] data-expanded:h-[var(--toast-height)]',
  // Resting position: collapsed stack, or spread out when expanded
  '[--toast-s:var(--toast-scale)] [--toast-y:calc(var(--toast-swipe-movement-y)_-_var(--toast-dir)*(var(--toast-index)*var(--toast-peek)_+_(1_-_var(--toast-scale))*var(--toast-clamp)))]',
  'data-expanded:[--toast-s:1] data-expanded:[--toast-y:calc(var(--toast-swipe-movement-y)_-_var(--toast-dir)*(var(--toast-offset-y)_+_var(--toast-index)*var(--toast-gap)))]',
  // Enter / exit offset, from and back to the viewport edge
  '[--toast-travel:100%] motion-reduce:[--toast-travel:0%]',
  '[--toast-exit-x:0px] [--toast-exit-y:0px]',
  'data-starting-style:[--toast-exit-y:calc(var(--toast-dir)*var(--toast-travel))]',
  'data-ending-style:[--toast-exit-y:calc(var(--toast-dir)*var(--toast-travel))]',
  'data-ending-style:data-[swipe-direction=down]:[--toast-exit-y:var(--toast-travel)]',
  'data-ending-style:data-[swipe-direction=up]:[--toast-exit-y:calc(-1*var(--toast-travel))]',
  'data-ending-style:data-[swipe-direction=right]:[--toast-exit-y:0px] data-ending-style:data-[swipe-direction=right]:[--toast-exit-x:var(--toast-travel)]',
  'data-ending-style:data-[swipe-direction=left]:[--toast-exit-y:0px] data-ending-style:data-[swipe-direction=left]:[--toast-exit-x:calc(-1*var(--toast-travel))]',
  '[transform:translateX(calc(var(--toast-swipe-movement-x)_+_var(--toast-exit-x)))_translateY(calc(var(--toast-y)_+_var(--toast-exit-y)))_scale(var(--toast-s))]',
  'data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:opacity-0',
  // Enter and restack in 400ms, exit in 200ms, same strong ease-out. Base UI
  // sets `transition: none` inline while the toast is being swiped.
  'transition-[transform,opacity,height] duration-400 ease-out-strong',
  'data-ending-style:duration-200',
  'motion-reduce:transition-opacity',
  // Fills the gap between expanded toasts so the stack doesn't collapse while
  // the pointer crosses it.
  "after:absolute after:inset-x-0 after:top-full after:h-[calc(var(--toast-gap)_+_1px)] after:content-['']",
  'data-[side=top]:after:top-auto data-[side=top]:after:bottom-full',
].join(' ');

// Content: hidden behind the frontmost toast while collapsed, fades back in
// when the stack expands.
const CONTENT_MOTION =
  'overflow-hidden transition-opacity duration-250 ease-out-strong data-behind:opacity-0 data-expanded:opacity-100';

type ToastProviderProps = React.ComponentProps<typeof ToastPrimitive.Provider>;

function ToastProvider(props: ToastProviderProps) {
  return <ToastPrimitive.Provider {...props} />;
}

type ToastPortalProps = React.ComponentProps<typeof ToastPrimitive.Portal>;

function ToastPortal(props: ToastPortalProps) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

type ToastViewportProps = React.ComponentProps<
  typeof ToastPrimitive.Viewport
> & {
  position?: ToastPosition;
};

function ToastViewport({
  position = 'bottom-right',
  ...props
}: ToastViewportProps) {
  return (
    <ToastPositionContext value={position}>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        data-position={position}
        {...props}
      />
    </ToastPositionContext>
  );
}

type ToastProps = React.ComponentProps<typeof ToastPrimitive.Root>;

function Toast({ className, swipeDirection, ...props }: ToastProps) {
  const position = React.use(ToastPositionContext);

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-side={getSide(position)}
      swipeDirection={swipeDirection ?? getSwipeDirection(position)}
      className={withClassName(ROOT_MOTION, className)}
      {...props}
    />
  );
}

type ToastContentProps = React.ComponentProps<typeof ToastPrimitive.Content>;

function ToastContent({ className, ...props }: ToastContentProps) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={withClassName(CONTENT_MOTION, className)}
      {...props}
    />
  );
}

type ToastTitleProps = React.ComponentProps<typeof ToastPrimitive.Title>;

function ToastTitle(props: ToastTitleProps) {
  return <ToastPrimitive.Title data-slot="toast-title" {...props} />;
}

type ToastDescriptionProps = React.ComponentProps<
  typeof ToastPrimitive.Description
>;

function ToastDescription(props: ToastDescriptionProps) {
  return (
    <ToastPrimitive.Description data-slot="toast-description" {...props} />
  );
}

type ToastActionProps = React.ComponentProps<typeof ToastPrimitive.Action>;

function ToastAction(props: ToastActionProps) {
  return <ToastPrimitive.Action data-slot="toast-action" {...props} />;
}

type ToastCloseProps = React.ComponentProps<typeof ToastPrimitive.Close>;

function ToastClose(props: ToastCloseProps) {
  return <ToastPrimitive.Close data-slot="toast-close" {...props} />;
}

const useToastManager = ToastPrimitive.useToastManager;
const createToastManager = ToastPrimitive.createToastManager;

type ToastObject = ToastPrimitive.Root.ToastObject;
type ToastManager = ReturnType<typeof createToastManager>;

export {
  ToastProvider,
  ToastPortal,
  ToastViewport,
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  useToastManager,
  createToastManager,
  type ToastPosition,
  type ToastProviderProps,
  type ToastPortalProps,
  type ToastViewportProps,
  type ToastProps,
  type ToastContentProps,
  type ToastTitleProps,
  type ToastDescriptionProps,
  type ToastActionProps,
  type ToastCloseProps,
  type ToastObject,
  type ToastManager,
};
