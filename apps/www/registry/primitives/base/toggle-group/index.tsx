'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui-components/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui-components/react/toggle-group';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from '@/registry/primitives/effects/highlight';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type ToggleGroupContextType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  setValue: ToggleGroupProps['onValueChange'];
  multiple: boolean | undefined;
};

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<ToggleGroupContextType>('ToggleGroupContext');

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive>;

function ToggleGroup(props: ToggleGroupProps) {
  const [value, setValue] = useControlledState({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: props.value as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: props.defaultValue as any[],
    onChange: props.onValueChange,
  });

  return (
    <ToggleGroupProvider value={{ value, setValue, multiple: props.multiple }}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        {...props}
        onValueChange={setValue}
      />
    </ToggleGroupProvider>
  );
}

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
  return (
    <TogglePrimitive
      value={value}
      disabled={disabled}
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      nativeButton={nativeButton}
      render={
        <motion.button
          data-slot="toggle"
          whileTap={{ scale: 0.95 }}
          {...props}
        />
      }
    />
  );
}

type ToggleGroupHighlightProps = Omit<HighlightProps, 'controlledItems'>;

function ToggleGroupHighlight({
  transition = { type: 'spring', stiffness: 200, damping: 25 },
  ...props
}: ToggleGroupHighlightProps) {
  const { value } = useToggleGroup();

  return (
    <Highlight
      data-slot="toggle-group-highlight"
      controlledItems
      value={value?.[0] ?? null}
      exitDelay={0}
      transition={transition}
      {...props}
    />
  );
}

type ToggleHighlightProps = HighlightItemProps &
  HTMLMotionProps<'div'> & {
    children: React.ReactElement;
  };

function ToggleHighlight({ children, style, ...props }: ToggleHighlightProps) {
  const { multiple, value } = useToggleGroup();

  if (!multiple) {
    return (
      <HighlightItem
        data-slot="toggle-highlight"
        style={{ inset: 0, ...style }}
        {...props}
      >
        {children}
      </HighlightItem>
    );
  }

  if (multiple && React.isValidElement(children)) {
    const isActive = props.value && value && value.includes(props.value);

    const element = children as React.ReactElement<React.ComponentProps<'div'>>;

    return React.cloneElement(
      children,
      {
        style: {
          ...element.props.style,
          position: 'relative',
        },
        ...element.props,
      },
      <>
        <AnimatePresence>
          {isActive && (
            <motion.div
              data-slot="toggle-highlight"
              style={{ position: 'absolute', inset: 0, zIndex: 0, ...style }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...props}
            />
          )}
        </AnimatePresence>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          {element.props.children}
        </div>
      </>,
    );
  }
}

export {
  ToggleGroup,
  ToggleGroupHighlight,
  Toggle,
  ToggleHighlight,
  useToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupHighlightProps,
  type ToggleProps,
  type ToggleHighlightProps,
  type ToggleGroupContextType,
};
