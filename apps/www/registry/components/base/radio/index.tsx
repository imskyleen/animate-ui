import * as React from 'react';
import { CircleIcon } from 'lucide-react';

import {
  RadioGroup as RadioGroupPrimitive,
  Radio as RadioPrimitive,
  RadioIndicator as RadioIndicatorPrimitive,
  type RadioGroupProps as RadioGroupPrimitiveProps,
  type RadioProps as RadioPrimitiveProps,
} from '@/registry/primitives/base/radio';
import { cn } from '@workspace/ui/lib/utils';

type RadioGroupProps = RadioGroupPrimitiveProps;

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive className={cn('grid gap-3', className)} {...props} />
  );
}

type RadioProps = RadioPrimitiveProps;

function Radio({ className, ...props }: RadioProps) {
  return (
    <RadioPrimitive
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioIndicatorPrimitive className="relative flex items-center justify-center">
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioIndicatorPrimitive>
    </RadioPrimitive>
  );
}

export { RadioGroup, Radio, type RadioGroupProps, type RadioProps };
