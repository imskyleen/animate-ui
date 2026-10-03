'use client';

import * as React from 'react';
import { MinusIcon } from 'lucide-react';

import {
  InputOTP as InputOTPPrimitive,
  InputOTPGroup as InputOTPGroupPrimitive,
  InputOTPSlot as InputOTPSlotPrimitive,
  InputOTPCaret as InputOTPCaretPrimitive,
  InputOTPSeparator as InputOTPSeparatorPrimitive,
  type InputOTPProps as InputOTPPrimitiveProps,
  type InputOTPGroupProps as InputOTPGroupPrimitiveProps,
  type InputOTPSlotProps as InputOTPSlotPrimitiveProps,
  type InputOTPSeparatorProps as InputOTPSeparatorPrimitiveProps,
} from '@/registry/primitives/animate/input-otp';
import { cn } from '@workspace/ui/lib/utils';

type InputOTPProps = InputOTPPrimitiveProps;

function InputOTP({ className, containerClassName, ...props }: InputOTPProps) {
  return (
    <InputOTPPrimitive
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

type InputOTPGroupProps = InputOTPGroupPrimitiveProps;

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <InputOTPGroupPrimitive
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

type InputOTPSlotProps = InputOTPSlotPrimitiveProps;

// No transition on the border and ring: the active slot follows typing,
// which is keyboard-driven, so it moves instantly.
function InputOTPSlot({ className, ...props }: InputOTPSlotProps) {
  return (
    <InputOTPSlotPrimitive
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
        className,
      )}
      {...props}
    >
      <InputOTPCaretPrimitive className="bg-foreground pointer-events-none absolute inset-0 m-auto h-4 w-px" />
    </InputOTPSlotPrimitive>
  );
}

type InputOTPSeparatorProps = InputOTPSeparatorPrimitiveProps;

function InputOTPSeparator({ children, ...props }: InputOTPSeparatorProps) {
  return (
    <InputOTPSeparatorPrimitive {...props}>
      {children ?? <MinusIcon />}
    </InputOTPSeparatorPrimitive>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  type InputOTPProps,
  type InputOTPGroupProps,
  type InputOTPSlotProps,
  type InputOTPSeparatorProps,
};
