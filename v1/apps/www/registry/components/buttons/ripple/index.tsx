'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/registry/components/buttons/button';
import {
  RippleButton as RippleButtonPrimitive,
  RippleButtonRipples as RippleButtonRipplesPrimitive,
  type RippleButtonProps as RippleButtonPrimitiveProps,
  type RippleButtonRipplesProps as RippleButtonRipplesPrimitiveProps,
} from '@/registry/primitives/buttons/ripple';
import { cn } from '@workspace/ui/lib/utils';

const rippleButtonVariants = {
  default: '[--ripple-button-ripple-color:var(--primary-foreground)]',
  accent: '[--ripple-button-ripple-color:var(--accent-foreground)]',
  destructive: '[--ripple-button-ripple-color:var(--destructive-foreground)]',
  outline: '[--ripple-button-ripple-color:var(--foreground)]',
  secondary: '[--ripple-button-ripple-color:var(--secondary-foreground)]',
  ghost: '[--ripple-button-ripple-color:var(--foreground)]',
  link: '[--ripple-button-ripple-color:var(--primary-foreground)]',
};

type RippleButtonProps = RippleButtonPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function RippleButton({
  className,
  variant,
  size,
  ...props
}: RippleButtonProps) {
  return (
    <RippleButtonPrimitive
      className={cn(
        buttonVariants({ variant, size, className }),
        rippleButtonVariants[variant as keyof typeof rippleButtonVariants],
      )}
      {...props}
    />
  );
}

type RippleButtonRipplesProps = RippleButtonRipplesPrimitiveProps;

function RippleButtonRipples(props: RippleButtonRipplesProps) {
  return <RippleButtonRipplesPrimitive {...props} />;
}

export {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
  type RippleButtonRipplesProps,
};
