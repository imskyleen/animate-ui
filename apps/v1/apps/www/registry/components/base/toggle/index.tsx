import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  Toggle as TogglePrimitive,
  ToggleItem as ToggleItemPrimitive,
  ToggleHighlight as ToggleHighlightPrimitive,
  type ToggleProps as TogglePrimitiveProps,
  type ToggleItemProps as ToggleItemPrimitiveProps,
} from '@/registry/primitives/base/toggle';
import { cn } from '@workspace/ui/lib/utils';

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted/40 hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,background-color,box-shadow] duration-200 ease-in-out aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent/40 hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ToggleProps = TogglePrimitiveProps &
  ToggleItemPrimitiveProps &
  VariantProps<typeof toggleVariants>;

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className="relative"
    >
      <ToggleHighlightPrimitive className="bg-accent rounded-md" />
      <ToggleItemPrimitive
        className={cn(toggleVariants({ variant, size, className }))}
        {...props}
      />
    </TogglePrimitive>
  );
}

export { Toggle, toggleVariants, type ToggleProps };
