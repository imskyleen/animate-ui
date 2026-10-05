import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import {
  FlipButton as FlipButtonPrimitive,
  FlipButtonFront as FlipButtonFrontPrimitive,
  FlipButtonBack as FlipButtonBackPrimitive,
  type FlipButtonProps as FlipButtonPrimitiveProps,
  type FlipButtonFrontProps as FlipButtonFrontPrimitiveProps,
  type FlipButtonBackProps as FlipButtonBackPrimitiveProps,
} from '@/registry/primitives/buttons/flip';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { buttonVariants } from '@/registry/components/buttons/button';
import { cn } from '@workspace/ui/lib/utils';

type FlipButtonContextType = VariantProps<typeof buttonVariants>;

const [FlipButtonProvider, useFlipButton] =
  getStrictContext<FlipButtonContextType>('FlipButtonContext');

type FlipButtonProps = FlipButtonPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButton({ variant, size, ...props }: FlipButtonProps) {
  return (
    <FlipButtonProvider value={{ variant, size }}>
      <FlipButtonPrimitive {...props} />
    </FlipButtonProvider>
  );
}

type FlipButtonFrontProps = FlipButtonFrontPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButtonFront({
  variant,
  size,
  className,
  ...props
}: FlipButtonFrontProps) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonFrontPrimitive
      className={cn(
        buttonVariants({
          variant: variant ?? buttonVariant,
          size: size ?? buttonSize,
          className,
        }),
      )}
      {...props}
    />
  );
}

type FlipButtonBackProps = FlipButtonBackPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButtonBack({
  variant,
  size,
  className,
  ...props
}: FlipButtonBackProps) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonBackPrimitive
      className={cn(
        buttonVariants({
          variant: variant ?? buttonVariant,
          size: size ?? buttonSize,
          className,
        }),
      )}
      {...props}
    />
  );
}

export {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
  type FlipButtonProps,
  type FlipButtonFrontProps,
  type FlipButtonBackProps,
};
