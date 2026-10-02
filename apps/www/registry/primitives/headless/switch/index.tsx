'use client';

import * as React from 'react';
import {
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from '@headlessui/react';
import {
  motion,
  type TargetAndTransition,
  type VariantLabels,
  type HTMLMotionProps,
  type LegacyAnimationControls,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  spring,
  transition as motionTransition,
} from '@/registry/lib/motion';

type SwitchContextType = {
  isChecked: boolean;
  isPressed: boolean;
};

const [SwitchProvider, useSwitch] =
  getStrictContext<SwitchContextType>('SwitchContext');

type SwitchProps<TTag extends React.ElementType = typeof motion.button> =
  SwitchPrimitiveProps<TTag> &
    HTMLMotionProps<'button'> & {
      as?: TTag;
    };

function Switch<TTag extends React.ElementType = typeof motion.button>(
  props: SwitchProps<TTag>,
) {
  const { as = motion.button, children, ...rest } = props;

  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <ReducedMotionConfig>
      <SwitchPrimitive
        data-slot="switch"
        initial={false}
        onTapStart={() => setIsPressed(true)}
        onTapCancel={() => setIsPressed(false)}
        onTap={() => setIsPressed(false)}
        {...rest}
        as={as}
      >
        {(bag) => (
          <SwitchProvider value={{ isPressed, isChecked: bag.checked }}>
            {typeof children === 'function' ? children(bag) : children}
          </SwitchProvider>
        )}
      </SwitchPrimitive>
    </ReducedMotionConfig>
  );
}

type SwitchThumbProps<TTag extends React.ElementType = typeof motion.div> =
  HTMLMotionProps<'div'> & {
    as?: TTag;
    pressedAnimation?:
      TargetAndTransition | VariantLabels | boolean | LegacyAnimationControls;
  };

function SwitchThumb<TTag extends React.ElementType = typeof motion.div>(
  props: SwitchThumbProps<TTag>,
) {
  const { isPressed, isChecked } = useSwitch();

  const {
    transition = spring.snappy,
    pressedAnimation,
    as: Component = motion.div,
    ...rest
  } = props;

  // `layout` animates position and size changes with transforms, so the
  // pressed stretch can be a plain style change (`data-pressed`).
  return (
    <Component
      data-slot="switch-thumb"
      data-pressed={isPressed || undefined}
      layout
      transition={transition}
      animate={isPressed ? pressedAnimation : undefined}
      {...(isChecked && { 'data-checked': true })}
      {...rest}
    />
  );
}

type SwitchIconPosition = 'left' | 'right' | 'thumb';

type SwitchIconProps<TTag extends React.ElementType = typeof motion.div> =
  HTMLMotionProps<'div'> & {
    position: SwitchIconPosition;
    as?: TTag;
  };

function SwitchIcon<TTag extends React.ElementType = typeof motion.div>(
  props: SwitchIconProps<TTag>,
) {
  const {
    position,
    transition = motionTransition.fade,
    as: Component = motion.div,
    ...rest
  } = props;
  const { isChecked } = useSwitch();

  const isAnimated = React.useMemo(() => {
    if (position === 'right') return !isChecked;
    if (position === 'left') return isChecked;
    if (position === 'thumb') return true;
    return false;
  }, [position, isChecked]);

  return (
    <Component
      data-slot={`switch-${position}-icon`}
      initial={false}
      animate={{ opacity: isAnimated ? 1 : 0 }}
      transition={transition}
      {...rest}
    />
  );
}

export {
  Switch,
  SwitchThumb,
  SwitchIcon,
  type SwitchProps,
  type SwitchThumbProps,
  type SwitchIconProps,
};
