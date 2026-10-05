import * as React from 'react';

import {
  Switch as SwitchPrimitive,
  SwitchThumb as SwitchThumbPrimitive,
  SwitchIcon as SwitchIconPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from '@/registry/primitives/radix/switch';
import { cn } from '@workspace/ui/lib/utils';

type SwitchProps = SwitchPrimitiveProps & {
  pressedWidth?: number;
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
  thumbIcon?: React.ReactElement;
};

function Switch({
  className,
  pressedWidth = 19,
  startIcon,
  endIcon,
  thumbIcon,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive
      className={cn(
        'relative peer focus-visible:border-ring focus-visible:ring-ring/50 flex h-5 w-8 px-px shrink-0 items-center justify-start rounded-full border border-transparent shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 data-[state=checked]:justify-end',
        className,
      )}
      {...props}
    >
      <SwitchThumbPrimitive
        className={cn(
          'relative z-10 bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0',
        )}
        pressedAnimation={{ width: pressedWidth }}
      >
        {thumbIcon && (
          <SwitchIconPrimitive
            position="thumb"
            className="absolute [&_svg]:size-[9px] left-1/2 top-1/2 -translate-1/2 dark:text-neutral-500 text-neutral-400"
          >
            {thumbIcon}
          </SwitchIconPrimitive>
        )}
      </SwitchThumbPrimitive>

      {startIcon && (
        <SwitchIconPrimitive
          position="left"
          className="absolute [&_svg]:size-[9px] left-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-500 text-neutral-400"
        >
          {startIcon}
        </SwitchIconPrimitive>
      )}
      {endIcon && (
        <SwitchIconPrimitive
          position="right"
          className="absolute [&_svg]:size-[9px] right-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-neutral-500"
        >
          {endIcon}
        </SwitchIconPrimitive>
      )}
    </SwitchPrimitive>
  );
}

export { Switch, type SwitchProps };
