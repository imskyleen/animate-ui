'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  LiquidButton as LiquidButtonPrimitive,
  type LiquidButtonProps as LiquidButtonPrimitiveProps,
} from '@/registry/primitives/buttons/liquid';
import { cn } from '@workspace/ui/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          '[--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--primary)] text-primary hover:text-primary-foreground shadow-xs',
        destructive:
          '[--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--destructive)] text-white shadow-xs focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        secondary:
          '[--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--secondary)] text-secondary hover:text-secondary-foreground shadow-xs',
        ghost:
          '[--liquid-button-background-color:var(--transparent)] [--liquid-button-color:var(--primary)] text-primary hover:text-primary-foreground shadow-xs',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type LiquidButtonProps = LiquidButtonPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function LiquidButton({
  className,
  variant,
  size,
  ...props
}: LiquidButtonProps) {
  return (
    <LiquidButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { LiquidButton, buttonVariants, type LiquidButtonProps };
