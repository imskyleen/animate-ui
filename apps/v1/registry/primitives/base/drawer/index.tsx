'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';

import { cn } from '@workspace/ui/lib/utils';

/**
 * Motion is CSS, not Motion: Base UI drives the swipe gesture itself through
 * CSS variables (`--drawer-swipe-movement-*`, `--drawer-swipe-progress`,
 * `--drawer-swipe-strength`) and `data-starting-style` / `data-ending-style`,
 * so the drawer animates with CSS transitions that read them. A JS animation
 * layered on top would fight the finger.
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

// Popup: rests at the swipe offset (so dragging follows the finger), starts
// and ends one full popup size off its edge. The edge comes from Base UI's
// `data-swipe-direction`; `--drawer-travel` drops to 0 under reduced motion so
// it fades in place instead (a swipe dismissal still follows the finger out).
const POPUP_MOTION = [
  '[--drawer-travel:1] motion-reduce:[--drawer-travel:0]',
  'data-swipe-dismiss:[--drawer-travel:1]',
  '[--drawer-dx:0] [--drawer-dy:0]',
  'data-[swipe-direction=down]:[--drawer-dy:1] data-[swipe-direction=up]:[--drawer-dy:-1]',
  'data-[swipe-direction=right]:[--drawer-dx:1] data-[swipe-direction=left]:[--drawer-dx:-1]',
  '[transform:translate3d(var(--drawer-swipe-movement-x),calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)),0)]',
  'data-starting-style:[transform:translate3d(calc(var(--drawer-dx)*var(--drawer-travel)*100%),calc(var(--drawer-dy)*var(--drawer-travel)*100%),0)]',
  'data-ending-style:[transform:translate3d(calc(var(--drawer-dx)*var(--drawer-travel)*100%),calc(var(--drawer-dy)*var(--drawer-travel)*100%),0)]',
  'motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0',
  // Open 600ms, close 400ms scaled by the release velocity, 0 while dragging.
  'transition-[transform,opacity] duration-600 ease-drawer',
  'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
  'data-swiping:duration-0 data-swiping:select-none',
  'data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
].join(' ');

// Backdrop: fades with the swipe progress, 600ms in, 400ms out.
const BACKDROP_MOTION = [
  'opacity-[calc(1-var(--drawer-swipe-progress))]',
  'data-starting-style:opacity-0 data-ending-style:opacity-0',
  'transition-opacity duration-600 ease-out-strong',
  'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
  'data-swiping:duration-0',
].join(' ');

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

function Drawer(props: DrawerProps) {
  return <DrawerPrimitive.Root {...props} />;
}

const createDrawerHandle = DrawerPrimitive.createHandle;

type DrawerTriggerProps = React.ComponentProps<typeof DrawerPrimitive.Trigger>;

function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

type DrawerSwipeAreaProps = React.ComponentProps<
  typeof DrawerPrimitive.SwipeArea
>;

function DrawerSwipeArea(props: DrawerSwipeAreaProps) {
  return <DrawerPrimitive.SwipeArea data-slot="drawer-swipe-area" {...props} />;
}

type DrawerPortalProps = React.ComponentProps<typeof DrawerPrimitive.Portal>;

function DrawerPortal(props: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

type DrawerBackdropProps = React.ComponentProps<
  typeof DrawerPrimitive.Backdrop
>;

function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-backdrop"
      className={withClassName(BACKDROP_MOTION, className)}
      {...props}
    />
  );
}

type DrawerViewportProps = React.ComponentProps<
  typeof DrawerPrimitive.Viewport
>;

function DrawerViewport(props: DrawerViewportProps) {
  return <DrawerPrimitive.Viewport data-slot="drawer-viewport" {...props} />;
}

type DrawerPopupProps = React.ComponentProps<typeof DrawerPrimitive.Popup>;

function DrawerPopup({ className, ...props }: DrawerPopupProps) {
  return (
    <DrawerPrimitive.Popup
      data-slot="drawer-popup"
      className={withClassName(POPUP_MOTION, className)}
      {...props}
    />
  );
}

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content>;

function DrawerContent(props: DrawerContentProps) {
  return <DrawerPrimitive.Content data-slot="drawer-content" {...props} />;
}

type DrawerCloseProps = React.ComponentProps<typeof DrawerPrimitive.Close>;

function DrawerClose(props: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

type DrawerHeaderProps = React.ComponentProps<'div'>;

function DrawerHeader(props: DrawerHeaderProps) {
  return <div data-slot="drawer-header" {...props} />;
}

type DrawerFooterProps = React.ComponentProps<'div'>;

function DrawerFooter(props: DrawerFooterProps) {
  return <div data-slot="drawer-footer" {...props} />;
}

type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>;

function DrawerTitle(props: DrawerTitleProps) {
  return <DrawerPrimitive.Title data-slot="drawer-title" {...props} />;
}

type DrawerDescriptionProps = React.ComponentProps<
  typeof DrawerPrimitive.Description
>;

function DrawerDescription(props: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description data-slot="drawer-description" {...props} />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerSwipeArea,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  createDrawerHandle,
  type DrawerProps,
  type DrawerTriggerProps,
  type DrawerSwipeAreaProps,
  type DrawerPortalProps,
  type DrawerBackdropProps,
  type DrawerViewportProps,
  type DrawerPopupProps,
  type DrawerContentProps,
  type DrawerCloseProps,
  type DrawerHeaderProps,
  type DrawerFooterProps,
  type DrawerTitleProps,
  type DrawerDescriptionProps,
};
