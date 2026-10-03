'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '@/registry/lib/motion';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type RadioGroupContextType = {
  value: RadioGroupProps['value'];
  setValue: RadioGroupProps['onValueChange'];
};

type RadioContextType = {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
};

const [RadioGroupProvider, useRadioGroup] =
  getStrictContext<RadioGroupContextType>('RadioGroupContext');

const [RadioProvider, useRadio] =
  getStrictContext<RadioContextType>('RadioContext');

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive>;

function RadioGroup(props: RadioGroupProps) {
  const [value, setValue] = useControlledState({
    value: props.value ?? undefined,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <RadioGroupProvider value={{ value, setValue }}>
      <RadioGroupPrimitive
        data-slot="radio-group"
        {...props}
        onValueChange={setValue}
      />
    </RadioGroupProvider>
  );
}

type RadioIndicatorProps = Omit<
  React.ComponentProps<typeof RadioPrimitive.Indicator>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'>;

function RadioIndicator({
  transition = spring.default,
  ...props
}: RadioIndicatorProps) {
  const { isChecked } = useRadio();

  return (
    <AnimatePresence>
      {isChecked && (
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          keepMounted
          render={
            <motion.div
              key="radio-group-indicator-circle"
              data-slot="radio-group-indicator-circle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={transition}
              {...props}
            />
          }
        />
      )}
    </AnimatePresence>
  );
}

type RadioProps = Omit<
  React.ComponentProps<typeof RadioPrimitive.Root>,
  'asChild'
> &
  HTMLMotionProps<'button'>;

function Radio({
  value: valueProps,
  disabled,
  required,
  // Rendered as a motion.button: tell Base UI it's a native button.
  nativeButton = true,
  ...props
}: RadioProps) {
  const { value } = useRadioGroup();
  const [isChecked, setIsChecked] = React.useState(value === valueProps);

  React.useEffect(() => {
    setIsChecked(value === valueProps);
  }, [value, valueProps]);

  return (
    <RadioProvider value={{ isChecked, setIsChecked }}>
      <RadioPrimitive.Root
        value={valueProps}
        disabled={disabled}
        required={required}
        nativeButton={nativeButton}
        render={
          <motion.button
            data-slot="radio-group-item"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
          />
        }
      />
    </RadioProvider>
  );
}

export {
  RadioGroup,
  Radio,
  RadioIndicator,
  useRadioGroup,
  useRadio,
  type RadioGroupProps,
  type RadioProps,
  type RadioIndicatorProps,
  type RadioGroupContextType,
  type RadioContextType,
};
