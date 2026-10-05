import type { IconProps } from '@/registry/icons/icon';
import React from 'react';

export type IconShowcaseProps = {
  icon: React.ComponentType<IconProps<string>>;
  displayTitle?: boolean;
} & IconProps<string>;

export const IconShowcase = ({
  icon: Icon,
  displayTitle = true,
  ...props
}: IconShowcaseProps) => {
  return (
    <div className="relative h-[200px] w-full lg:w-[250px] max-w-[250px] mx-auto rounded-2xl aspect-square bg-muted/50 border flex items-center justify-center">
      {props.animation && displayTitle ? (
        <p className="absolute whitespace-nowrap -top-4.5 py-1.5 px-3 bg-border rounded-b-lg left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
          {props.animation}
        </p>
      ) : null}
      <Icon animate className="text-current size-[100px]" {...props} />
    </div>
  );
};
