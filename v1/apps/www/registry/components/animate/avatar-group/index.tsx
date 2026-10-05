import * as React from 'react';
import * as motion from 'motion/react-client';

import {
  AvatarGroup as AvatarGroupPrimitive,
  AvatarGroupTooltip as AvatarGroupTooltipPrimitive,
  AvatarGroupTooltipArrow as AvatarGroupTooltipArrowPrimitive,
  type AvatarGroupProps as AvatarGroupPropsPrimitive,
  type AvatarGroupTooltipProps as AvatarGroupTooltipPropsPrimitive,
} from '@/registry/primitives/animate/avatar-group';
import { cn } from '@workspace/ui/lib/utils';

type AvatarGroupProps = AvatarGroupPropsPrimitive;

function AvatarGroup({
  className,
  invertOverlap = true,
  ...props
}: AvatarGroupProps) {
  return (
    <AvatarGroupPrimitive
      className={cn('h-12 -space-x-3', className)}
      invertOverlap={invertOverlap}
      {...props}
    />
  );
}

type AvatarGroupTooltipProps = Omit<
  AvatarGroupTooltipPropsPrimitive,
  'asChild'
> & {
  children: React.ReactNode;
  layout?: boolean | 'position' | 'size' | 'preserve-aspect';
};

function AvatarGroupTooltip({
  className,
  children,
  layout = 'preserve-aspect',
  ...props
}: AvatarGroupTooltipProps) {
  return (
    <AvatarGroupTooltipPrimitive
      className={cn(
        'bg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance',
        className,
      )}
      {...props}
    >
      <motion.div layout={layout} className="overflow-hidden">
        {children}
      </motion.div>
      <AvatarGroupTooltipArrowPrimitive
        className="fill-primary size-3 data-[side='bottom']:translate-y-[1px] data-[side='right']:translate-x-[1px] data-[side='left']:translate-x-[-1px] data-[side='top']:translate-y-[-1px]"
        tipRadius={2}
      />
    </AvatarGroupTooltipPrimitive>
  );
}

export {
  AvatarGroup,
  AvatarGroupTooltip,
  type AvatarGroupProps,
  type AvatarGroupTooltipProps,
};
