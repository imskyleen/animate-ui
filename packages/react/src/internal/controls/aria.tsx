'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import { usePressedMotion } from './press';
import {
  useRenderedIndicator,
  type IndicatorAnimationProps,
} from './indicator';
import { useThumbGlide, type ThumbAnimationProps } from './thumb';

// React Aria pieces of the toggles and choice controls. React Aria renders
// these controls with render props (`isSelected`, `isPressed`…): the root
// becomes a motion element through its `render` prop, and the parts the
// user renders (indicator, thumb) are found by their shadcn/ui `data-slot`.

type PressedMotionProps = Record<string, unknown> & {
  as: 'label' | 'button';
  isPressed: boolean;
  transition?: Transition;
};

/** A control's root (React Aria's `render` output) with press feedback. */
function PressedMotion({
  as,
  isPressed,
  transition,
  ...props
}: PressedMotionProps) {
  const press = usePressedMotion(isPressed, transition);
  if (as === 'button')
    return (
      <motion.button {...(props as HTMLMotionProps<'button'>)} {...press} />
    );
  return <motion.label {...(props as HTMLMotionProps<'label'>)} {...press} />;
}

type RenderedIndicatorProps = IndicatorAnimationProps & {
  rootRef: React.RefObject<Element | null>;
  selector: string;
  checked: boolean;
};

/** Animates the indicator the user renders; renders nothing itself. */
function RenderedIndicator({
  rootRef,
  selector,
  checked,
  transition,
  exitTransition,
}: RenderedIndicatorProps) {
  useRenderedIndicator(rootRef, selector, checked, {
    transition,
    exitTransition,
  });
  return null;
}

type RenderedThumbProps = ThumbAnimationProps & {
  rootRef: React.RefObject<Element | null>;
  checked: boolean;
};

/** Glides the thumb the user renders (`data-slot="switch-thumb"`). */
function RenderedThumb({ rootRef, checked, transition }: RenderedThumbProps) {
  useThumbGlide(
    () =>
      rootRef.current?.querySelector<HTMLElement>('[data-slot="switch-thumb"]'),
    checked,
    { transition },
  );
  return null;
}

/** Calls a React Aria `children` render prop like React Aria does. */
function renderChildren<T extends object>(
  children: React.ReactNode | ((values: T) => React.ReactNode),
  values: T,
) {
  return typeof children === 'function' ? children(values) : children;
}

export {
  PressedMotion,
  RenderedIndicator,
  RenderedThumb,
  renderChildren,
  type PressedMotionProps,
};
