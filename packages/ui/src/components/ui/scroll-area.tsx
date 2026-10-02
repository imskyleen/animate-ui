import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {children}
      <ScrollAreaPrimitive.Corner />
      <ScrollBar orientation="vertical" />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollViewport({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return (
    <ScrollAreaPrimitive.Viewport
      className={cn('size-full rounded-[inherit]', className)}
      {...props}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        'flex select-none data-[state=hidden]:animate-fd-fade-out',
        orientation === 'vertical' && 'h-full w-1.5',
        orientation === 'horizontal' && 'h-1.5 flex-col',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-fd-border" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar, ScrollViewport };
