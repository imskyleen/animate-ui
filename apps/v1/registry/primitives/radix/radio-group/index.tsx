'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type RadioGroupContextType = {
  value: string;
  setValue: (value: string) => void;
};

type RadioGroupItemContextType = {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
};

const [RadioGroupProvider, useRadioGroup] =
  getStrictContext<RadioGroupContextType>('RadioGroupContext');

const [RadioGroupItemProvider, useRadioGroupItem] =
  getStrictContext<RadioGroupItemContextType>('RadioGroupItemContext');

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

function RadioGroup(props: RadioGroupProps) {
  const [value, setValue] = useControlledState({
    value: props.value ?? undefined,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <RadioGroupProvider value={{ value, setValue }}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        {...props}
        onValueChange={setValue}
      />
    </RadioGroupProvider>
  );
}

type RadioGroupIndicatorProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Indicator>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'>;

function RadioGroupIndicator({
  transition = { type: 'spring', stiffness: 200, damping: 16 },
  ...props
}: RadioGroupIndicatorProps) {
  const { isChecked } = useRadioGroupItem();

  return (
    <AnimatePresence>
      {isChecked && (
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          asChild
          forceMount
        >
          <motion.div
            key="radio-group-indicator-circle"
            data-slot="radio-group-indicator-circle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={transition}
            {...props}
          />
        </RadioGroupPrimitive.Indicator>
      )}
    </AnimatePresence>
  );
}

type RadioGroupItemProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Item>,
  'asChild'
> &
  HTMLMotionProps<'button'>;

function RadioGroupItem({
  value: valueProps,
  disabled,
  required,
  ...props
}: RadioGroupItemProps) {
  const { value } = useRadioGroup();
  const [isChecked, setIsChecked] = React.useState(value === valueProps);

  React.useEffect(() => {
    setIsChecked(value === valueProps);
  }, [value, valueProps]);

  return (
    <RadioGroupItemProvider value={{ isChecked, setIsChecked }}>
      <RadioGroupPrimitive.Item
        asChild
        value={valueProps}
        disabled={disabled}
        required={required}
      >
        <motion.button
          data-slot="radio-group-item"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...props}
        />
      </RadioGroupPrimitive.Item>
    </RadioGroupItemProvider>
  );
}

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
  useRadioGroup,
  useRadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type RadioGroupIndicatorProps,
  type RadioGroupContextType,
  type RadioGroupItemContextType,
};
