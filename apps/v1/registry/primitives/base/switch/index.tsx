'use client';

import * as React from 'react';
import { Switch as SwitchPrimitives } from '@base-ui/react/switch';
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
  setIsChecked: SwitchProps['onCheckedChange'];
  isPressed: boolean;
  setIsPressed: (isPressed: boolean) => void;
};

const [SwitchProvider, useSwitch] =
  getStrictContext<SwitchContextType>('SwitchContext');

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitives.Root>,
  'render'
> &
  HTMLMotionProps<'button'>;

function Switch({
  name,
  defaultChecked,
  checked,
  onCheckedChange,
  // Rendered as a motion.button: tell Base UI it's a native button.
  nativeButton = true,
  disabled,
  readOnly,
  required,
  inputRef,
  id,
  ...props
}: SwitchProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <SwitchProvider
      value={{ isChecked, setIsChecked, isPressed, setIsPressed }}
    >
      <ReducedMotionConfig>
        <SwitchPrimitives.Root
          name={name}
          defaultChecked={defaultChecked}
          checked={checked}
          onCheckedChange={setIsChecked}
          nativeButton={nativeButton}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          inputRef={inputRef}
          id={id}
          render={
            <motion.button
              data-slot="switch"
              initial={false}
              onTapStart={() => setIsPressed(true)}
              onTapCancel={() => setIsPressed(false)}
              onTap={() => setIsPressed(false)}
              {...props}
            />
          }
        />
      </ReducedMotionConfig>
    </SwitchProvider>
  );
}

type SwitchThumbProps = Omit<
  React.ComponentProps<typeof SwitchPrimitives.Thumb>,
  'render'
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
    <SwitchPrimitives.Thumb
      render={
        <motion.div
          data-slot="switch-thumb"
          data-pressed={isPressed || undefined}
          layout
          transition={transition}
          animate={isPressed ? pressedAnimation : undefined}
          {...props}
        />
      }
    />
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
