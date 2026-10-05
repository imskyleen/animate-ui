import * as React from 'react';

import {
  Progress as ProgressPrimitive,
  ProgressIndicator as ProgressIndicatorPrimitive,
  type ProgressProps as ProgressPrimitiveProps,
} from '@/registry/primitives/radix/progress';
import { cn } from '@workspace/ui/lib/utils';

type ProgressProps = ProgressPrimitiveProps;

function Progress({ className, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressIndicatorPrimitive className="bg-primary rounded-full h-full w-full flex-1" />
    </ProgressPrimitive>
  );
}

export { Progress, type ProgressProps };
