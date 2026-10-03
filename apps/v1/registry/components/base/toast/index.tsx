'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';

import {
  ToastProvider as ToastProviderPrimitive,
  ToastPortal as ToastPortalPrimitive,
  ToastViewport as ToastViewportPrimitive,
  Toast as ToastPrimitive,
  ToastContent as ToastContentPrimitive,
  ToastTitle as ToastTitlePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  useToastManager,
  createToastManager,
  type ToastPosition,
  type ToastProviderProps as ToastProviderPrimitiveProps,
  type ToastObject,
  type ToastManager,
} from '@/registry/primitives/base/toast';
import { cn } from '@workspace/ui/lib/utils';

type ToasterProps = Omit<ToastProviderPrimitiveProps, 'children'> & {
  children?: React.ReactNode;
  position?: ToastPosition;
  closeButton?: boolean;
  className?: string;
};

function Toaster({
  children,
  position = 'bottom-right',
  closeButton = true,
  className,
  ...props
}: ToasterProps) {
  return (
    <ToastProviderPrimitive {...props}>
      {children}
      <ToastPortalPrimitive>
        <ToastViewportPrimitive
          position={position}
          className={cn(
            'fixed z-50 w-[calc(100%-2rem)] outline-none sm:w-[22rem]',
            'data-[position^=bottom]:bottom-4 data-[position^=top]:top-4 sm:data-[position^=bottom]:bottom-6 sm:data-[position^=top]:top-6',
            'data-[position$=right]:right-4 data-[position$=left]:left-4 sm:data-[position$=right]:right-6 sm:data-[position$=left]:left-6',
            'data-[position$=center]:inset-x-0 data-[position$=center]:mx-auto',
            className,
          )}
        >
          <ToastList closeButton={closeButton} />
        </ToastViewportPrimitive>
      </ToastPortalPrimitive>
    </ToastProviderPrimitive>
  );
}

function ToastList({ closeButton }: { closeButton: boolean }) {
  const { toasts } = useToastManager();

  return toasts.map((toast) => (
    <ToastPrimitive
      key={toast.id}
      toast={toast}
      className="bg-popover text-popover-foreground focus-visible:ring-ring/50 rounded-lg border shadow-lg outline-none focus-visible:ring-[3px]"
    >
      <ToastContentPrimitive className="flex items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitlePrimitive className="text-sm leading-tight font-medium" />
          <ToastDescriptionPrimitive className="text-muted-foreground text-sm" />
        </div>
        <ToastActionPrimitive className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 h-7 shrink-0 rounded-md px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]" />
        {closeButton && (
          <ToastClosePrimitive
            aria-label="Close"
            className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 flex size-6 shrink-0 items-center justify-center self-start rounded-md transition-colors outline-none focus-visible:ring-[3px] [&_svg]:size-4"
          >
            <XIcon />
          </ToastClosePrimitive>
        )}
      </ToastContentPrimitive>
    </ToastPrimitive>
  ));
}

export {
  Toaster,
  useToastManager,
  createToastManager,
  type ToasterProps,
  type ToastPosition,
  type ToastObject,
  type ToastManager,
};
