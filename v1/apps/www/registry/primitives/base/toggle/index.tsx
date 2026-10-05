'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui-components/react/toggle';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type ToggleContextType = {
  isPressed: boolean;
  setIsPressed: ToggleProps['onPressedChange'];
  disabled?: boolean;
};

const [ToggleProvider, useToggle] =
  getStrictContext<ToggleContextType>('ToggleContext');

type ToggleProps = Omit<
  React.ComponentProps<typeof TogglePrimitive>,
  'render'
> &
  HTMLMotionProps<'button'>;

function Toggle({
  value,
  pressed,
  defaultPressed,
  onPressedChange,
  nativeButton,
  disabled,
  ...props
}: ToggleProps) {
  const [isPressed, setIsPressed] = useControlledState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  return (
    <ToggleProvider value={{ isPressed, setIsPressed, disabled }}>
      <TogglePrimitive
        value={value}
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={setIsPressed}
        nativeButton={nativeButton}
        disabled={disabled}
        render={
          <motion.button
            data-slot="toggle"
            whileTap={{ scale: 0.95 }}
            {...props}
          />
        }
      />
    </ToggleProvider>
  );
}

type ToggleHighlightProps = HTMLMotionProps<'div'>;

function ToggleHighlight({ style, ...props }: ToggleHighlightProps) {
  const { isPressed, disabled } = useToggle();

  return (
    <AnimatePresence>
      {isPressed && (
        <motion.div
          data-slot="toggle-highlight"
          aria-pressed={isPressed}
          {...(isPressed && { 'data-pressed': true })}
          {...(disabled && { 'data-disabled': true })}
          style={{ position: 'absolute', zIndex: 0, inset: 0, ...style }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type ToggleItemProps = HTMLMotionProps<'div'>;

function ToggleItem({ style, ...props }: ToggleItemProps) {
  const { isPressed, disabled } = useToggle();

  return (
    <motion.div
      data-slot="toggle-item"
      aria-pressed={isPressed}
      {...(isPressed && { 'data-pressed': true })}
      {...(disabled && { 'data-disabled': true })}
      style={{ position: 'relative', zIndex: 1, ...style }}
      {...props}
    />
  );
}

export {
  Toggle,
  ToggleHighlight,
  ToggleItem,
  useToggle,
  type ToggleProps,
  type ToggleHighlightProps,
  type ToggleItemProps,
  type ToggleContextType,
};
