import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import {
  ToggleGroup as ToggleGroupPrimitive,
  Toggle as TogglePrimitive,
  ToggleGroupHighlight as ToggleGroupHighlightPrimitive,
  ToggleHighlight as ToggleHighlightPrimitive,
  useToggleGroup as useToggleGroupPrimitive,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
  type ToggleProps as TogglePrimitiveProps,
} from '@/registry/primitives/base/toggle-group';
import { toggleVariants } from '@/registry/components/base/toggle';
import { cn } from '@workspace/ui/lib/utils';
import { getStrictContext } from '@/registry/lib/get-strict-context';

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<VariantProps<typeof toggleVariants>>('ToggleGroupContext');

type ToggleGroupProps = ToggleGroupPrimitiveProps &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({
  className,
  variant,
  size,
  children,
  multiple,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/toggle-group flex gap-0.5 w-fit items-center rounded-lg data-[variant=outline]:shadow-xs data-[variant=outline]:border data-[variant=outline]:p-0.5',
        className,
      )}
      multiple={multiple}
      {...props}
    >
      <ToggleGroupProvider value={{ variant, size }}>
        {!multiple ? (
          <ToggleGroupHighlightPrimitive className="bg-accent rounded-md">
            {children}
          </ToggleGroupHighlightPrimitive>
        ) : (
          children
        )}
      </ToggleGroupProvider>
    </ToggleGroupPrimitive>
  );
}

type ToggleProps = TogglePrimitiveProps & VariantProps<typeof toggleVariants>;

function Toggle({ className, children, variant, size, ...props }: ToggleProps) {
  const { variant: contextVariant, size: contextSize } = useToggleGroup();
  const { multiple } = useToggleGroupPrimitive();

  return (
    <ToggleHighlightPrimitive
      value={props.value?.toString()}
      className={cn(multiple && 'bg-accent rounded-md')}
    >
      <TogglePrimitive
        data-variant={contextVariant || variant}
        data-size={contextSize || size}
        className={cn(
          toggleVariants({
            variant: contextVariant || variant,
            size: contextSize || size,
          }),
          'min-w-0 border-0 flex-1 shrink-0 shadow-none rounded-md focus:z-10 focus-visible:z-10',
          className,
        )}
        {...props}
      >
        {children}
      </TogglePrimitive>
    </ToggleHighlightPrimitive>
  );
}

export { ToggleGroup, Toggle, type ToggleGroupProps, type ToggleProps };
