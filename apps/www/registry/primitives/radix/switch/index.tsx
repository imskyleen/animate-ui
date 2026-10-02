'use client';

import * as React from 'react';
import { Switch as SwitchPrimitives } from 'radix-ui';
import {
  motion,
  type TargetAndTransition,
  type VariantLabels,
  type HTMLMotionProps,
  type LegacyAnimationControls,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  spring,
  transition as motionTransition,
} from '@/registry/lib/motion';

type SwitchContextType = {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  isPressed: boolean;
  setIsPressed: (isPressed: boolean) => void;
};

const [SwitchProvider, useSwitch] =
  getStrictContext<SwitchContextType>('SwitchContext');

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitives.Root>,
  'asChild'
> &
  HTMLMotionProps<'button'>;

function Switch(props: SwitchProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isChecked, setIsChecked] = useControlledState({
    value: props.checked,
    defaultValue: props.defaultChecked,
    onChange: props.onCheckedChange,
  });

  return (
    <SwitchProvider
      value={{ isChecked, setIsChecked, isPressed, setIsPressed }}
    >
      <ReducedMotionConfig>
        <SwitchPrimitives.Root
          {...props}
          onCheckedChange={setIsChecked}
          asChild
        >
          <motion.button
            data-slot="switch"
            initial={false}
            onTapStart={() => setIsPressed(true)}
            onTapCancel={() => setIsPressed(false)}
            onTap={() => setIsPressed(false)}
            {...props}
          />
        </SwitchPrimitives.Root>
      </ReducedMotionConfig>
    </SwitchProvider>
  );
}

type SwitchThumbProps = Omit<
  React.ComponentProps<typeof SwitchPrimitives.Thumb>,
  'asChild'
> &
  HTMLMotionProps<'div'> & {
    pressedAnimation?:
      TargetAndTransition | VariantLabels | boolean | LegacyAnimationControls;
  };

function SwitchThumb({
  pressedAnimation,
  transition = spring.snappy,
  ...props
}: SwitchThumbProps) {
  const { isPressed } = useSwitch();

  // `layout` animates position and size changes with transforms, so the
  // pressed stretch can be a plain style change (`data-pressed`).
  return (
    <SwitchPrimitives.Thumb asChild>
      <motion.div
        data-slot="switch-thumb"
        data-pressed={isPressed || undefined}
        layout
        transition={transition}
        animate={isPressed ? pressedAnimation : undefined}
        {...props}
      />
    </SwitchPrimitives.Thumb>
  );
}

type SwitchIconPosition = 'left' | 'right' | 'thumb';

type SwitchIconProps = HTMLMotionProps<'div'> & {
  position: SwitchIconPosition;
};

function SwitchIcon({
  position,
  transition = motionTransition.fade,
  ...props
}: SwitchIconProps) {
  const { isChecked } = useSwitch();

  const isAnimated = React.useMemo(() => {
    if (position === 'right') return !isChecked;
    if (position === 'left') return isChecked;
    if (position === 'thumb') return true;
    return false;
  }, [position, isChecked]);

  return (
    <motion.div
      data-slot={`switch-${position}-icon`}
      initial={false}
      animate={{ opacity: isAnimated ? 1 : 0 }}
      transition={transition}
      {...props}
    />
  );
}

export {
  Switch,
  SwitchThumb,
  SwitchIcon,
  useSwitch,
  type SwitchProps,
  type SwitchThumbProps,
  type SwitchIconProps,
  type SwitchIconPosition,
  type SwitchContextType,
};
