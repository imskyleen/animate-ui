import * as React from 'react';

import {
  PreviewCard as PreviewCardPrimitive,
  PreviewCardTrigger as PreviewCardTriggerPrimitive,
  PreviewCardPortal as PreviewCardPortalPrimitive,
  PreviewCardPositioner as PreviewCardPositionerPrimitive,
  PreviewCardPopup as PreviewCardPopupPrimitive,
  PreviewCardBackdrop as PreviewCardBackdropPrimitive,
  type PreviewCardProps as PreviewCardPrimitiveProps,
  type PreviewCardTriggerProps as PreviewCardTriggerPrimitiveProps,
  type PreviewCardPositionerProps as PreviewCardPositionerPrimitiveProps,
  type PreviewCardPopupProps as PreviewCardPopupPrimitiveProps,
  type PreviewCardBackdropProps as PreviewCardBackdropPrimitiveProps,
} from '@/registry/primitives/base/preview-card';
import { cn } from '@workspace/ui/lib/utils';

type PreviewCardProps = PreviewCardPrimitiveProps;

function PreviewCard(props: PreviewCardProps) {
  return <PreviewCardPrimitive {...props} />;
}

type PreviewCardTriggerProps = PreviewCardTriggerPrimitiveProps;

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  return <PreviewCardTriggerPrimitive {...props} />;
}

type PreviewCardPanelProps = PreviewCardPositionerPrimitiveProps &
  PreviewCardPopupPrimitiveProps;

function PreviewCardPanel({
  className,
  align = 'center',
  sideOffset = 4,
  style,
  children,
  ...props
}: PreviewCardPanelProps) {
  return (
    <PreviewCardPortalPrimitive>
      <PreviewCardPositionerPrimitive
        align={align}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <PreviewCardPopupPrimitive
          className={cn(
            'bg-popover text-popover-foreground w-64 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden',
            className,
          )}
          style={style}
        >
          {children}
        </PreviewCardPopupPrimitive>
      </PreviewCardPositionerPrimitive>
    </PreviewCardPortalPrimitive>
  );
}

type PreviewCardBackdropProps = PreviewCardBackdropPrimitiveProps;

function PreviewCardBackdrop(props: PreviewCardBackdropProps) {
  return <PreviewCardBackdropPrimitive {...props} />;
}

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPanel,
  PreviewCardBackdrop,
  type PreviewCardProps,
  type PreviewCardTriggerProps,
  type PreviewCardPanelProps,
  type PreviewCardBackdropProps,
};
