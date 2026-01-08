import * as React from 'react';

import {
  TooltipProvider as TooltipProviderPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
  TooltipPositioner as TooltipPositionerPrimitive,
  TooltipPopup as TooltipPopupPrimitive,
  TooltipArrow as TooltipArrowPrimitive,
  TooltipPortal as TooltipPortalPrimitive,
  type TooltipProviderProps as TooltipProviderPrimitiveProps,
  type TooltipProps as TooltipPrimitiveProps,
  type TooltipTriggerProps as TooltipTriggerPrimitiveProps,
  type TooltipPositionerProps as TooltipPositionerPrimitiveProps,
  type TooltipPopupProps as TooltipPopupPrimitiveProps,
} from '@/registry/primitives/base/tooltip';
import { cn } from '@workspace/ui/lib/utils';

type TooltipProviderProps = TooltipProviderPrimitiveProps;

function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return <TooltipProviderPrimitive delay={delay} {...props} />;
}

type TooltipProps = TooltipPrimitiveProps & {
  delay?: TooltipProviderPrimitiveProps['delay'];
};

function Tooltip({ delay = 0, ...props }: TooltipProps) {
  return (
    <TooltipProvider delay={delay}>
      <TooltipPrimitive {...props} />
    </TooltipProvider>
  );
}

type TooltipTriggerProps = TooltipTriggerPrimitiveProps;

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipTriggerPrimitive {...props} />;
}

type TooltipPanelProps = TooltipPositionerPrimitiveProps &
  TooltipPopupPrimitiveProps;

function TooltipPanel({
  className,
  sideOffset = 4,
  children,
  style,
  ...props
}: TooltipPanelProps) {
  return (
    <TooltipPortalPrimitive>
      <TooltipPositionerPrimitive
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <TooltipPopupPrimitive
          className={cn(
            'bg-primary text-primary-foreground w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
            className,
          )}
          style={style}
        >
          {children}
          <TooltipArrowPrimitive className="bg-primary fill-primary z-50 size-2.5 data-[side='bottom']:-top-[4px] data-[side='right']:-left-[4px] data-[side='left']:-right-[4px] data-[side='inline-start']:-right-[4px] data-[side='inline-end']:-left-[4px] rotate-45 rounded-[2px]" />
        </TooltipPopupPrimitive>
      </TooltipPositionerPrimitive>
    </TooltipPortalPrimitive>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipPanel,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPanelProps,
};
