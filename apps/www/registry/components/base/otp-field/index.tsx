'use client';

import * as React from 'react';
import { MinusIcon } from 'lucide-react';

import {
  OTPField as OTPFieldPrimitive,
  OTPFieldInput as OTPFieldInputPrimitive,
  OTPFieldCaret as OTPFieldCaretPrimitive,
  OTPFieldSeparator as OTPFieldSeparatorPrimitive,
  type OTPFieldProps as OTPFieldPrimitiveProps,
  type OTPFieldInputProps as OTPFieldInputPrimitiveProps,
  type OTPFieldSeparatorProps as OTPFieldSeparatorPrimitiveProps,
} from '@/registry/primitives/base/otp-field';
import { cn } from '@workspace/ui/lib/utils';

type OTPFieldProps = OTPFieldPrimitiveProps;

function OTPField({ className, ...props }: OTPFieldProps) {
  return (
    <OTPFieldPrimitive
      className={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

type OTPFieldGroupProps = React.ComponentProps<'div'>;

function OTPFieldGroup({ className, ...props }: OTPFieldGroupProps) {
  return (
    <div
      data-slot="otp-field-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

type OTPFieldInputProps = OTPFieldInputPrimitiveProps;

// The wrapper is the visible slot; the input fills it with its glyph hidden.
// No transition on the border and ring: focus follows typing, which is
// keyboard-driven, so it moves instantly.
function OTPFieldInput({
  className,
  containerClassName,
  ...props
}: OTPFieldInputProps) {
  return (
    <OTPFieldInputPrimitive
      containerClassName={cn(
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:data-invalid:ring-destructive/20 dark:focus-within:data-invalid:ring-destructive/40 data-invalid:border-destructive focus-within:data-invalid:border-destructive dark:bg-input/30 border-input relative h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs first:rounded-l-md first:border-l last:rounded-r-md focus-within:z-10 focus-within:ring-[3px]',
        containerClassName,
      )}
      className={cn(
        'size-full min-w-0 bg-transparent p-0 text-center outline-none selection:bg-transparent disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      <OTPFieldCaretPrimitive className="bg-foreground h-4 w-px" />
    </OTPFieldInputPrimitive>
  );
}

type OTPFieldSeparatorProps = OTPFieldSeparatorPrimitiveProps;

function OTPFieldSeparator({ children, ...props }: OTPFieldSeparatorProps) {
  return (
    <OTPFieldSeparatorPrimitive {...props}>
      {children ?? <MinusIcon />}
    </OTPFieldSeparatorPrimitive>
  );
}

export {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  type OTPFieldProps,
  type OTPFieldGroupProps,
  type OTPFieldInputProps,
  type OTPFieldSeparatorProps,
};
