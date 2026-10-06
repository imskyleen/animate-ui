'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

import type { CheckAnimation } from '../../utils/motion';
import { usePressedMotion } from './press';
import {
  useRenderedIndicator,
  type IndicatorAnimationProps,
  type IndicatorKind,
} from './indicator';
import { useSwitchThumb, type ThumbAnimationProps } from './thumb';

// React Aria pieces of the toggles and choice controls. React Aria renders
// these controls with render props (`isSelected`, `isPressed`…): the root
// becomes a motion element through its `render` prop, and the parts the
// user renders (indicator, thumb) are found by their shadcn/ui `data-slot`.

type PressedMotionProps = Record<string, unknown> & {
  as: 'label' | 'button';
  isPressed: boolean;
  isDisabled?: boolean;
  transition?: Transition;
};

/** A control's root (React Aria's `render` output) with press feedback. */
function PressedMotion({
  as,
  isPressed,
  isDisabled,
  transition,
  ...props
}: PressedMotionProps) {
  const press = usePressedMotion(
    { isPressed },
    { disabled: isDisabled, transition },
  );
  if (as === 'button')
    return (
      <motion.button {...(props as HTMLMotionProps<'button'>)} {...press} />
    );
  return <motion.label {...(props as HTMLMotionProps<'label'>)} {...press} />;
}

type RenderedIndicatorProps = IndicatorAnimationProps & {
  rootRef: React.RefObject<Element | null>;
  selector: string;
  kind: IndicatorKind;
  /** How a check shows and hides (a dot always pops). */
  animation?: CheckAnimation;
  checked: boolean;
  indeterminate?: boolean;
};

/** Animates the indicator the user renders; renders nothing itself. */
function RenderedIndicator({
  rootRef,
  selector,
  kind,
  animation,
  checked,
  indeterminate,
  transition,
  exitTransition,
}: RenderedIndicatorProps) {
  useRenderedIndicator(
    rootRef,
    selector,
    kind,
    { checked, indeterminate, animation },
    { transition, exitTransition },
  );
  return null;
}

type RenderedThumbProps = ThumbAnimationProps & {
  rootRef: React.RefObject<Element | null>;
  checked: boolean;
  pressed: boolean;
};

/**
 * Animates the thumb the user renders (`data-slot="switch-thumb"`): stretched
 * while pressed, gliding to its new side. Renders nothing itself.
 */
function RenderedThumb({
  rootRef,
  checked,
  pressed,
  transition,
}: RenderedThumbProps) {
  useSwitchThumb(
    () =>
      rootRef.current?.querySelector<HTMLElement>('[data-slot="switch-thumb"]'),
    { checked, pressed, transition },
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
