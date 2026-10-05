import * as React from 'react';

import {
  PreviewLinkCard as PreviewLinkCardPrimitive,
  PreviewLinkCardTrigger as PreviewLinkCardTriggerPrimitive,
  PreviewLinkCardPortal as PreviewLinkCardPortalPrimitive,
  PreviewLinkCardPositioner as PreviewLinkCardPositionerPrimitive,
  PreviewLinkCardPopup as PreviewLinkCardPopupPrimitive,
  PreviewLinkCardImage as PreviewLinkCardImagePrimitive,
  PreviewLinkCardBackdrop as PreviewLinkCardBackdropPrimitive,
  type PreviewLinkCardProps as PreviewLinkCardPrimitiveProps,
  type PreviewLinkCardTriggerProps as PreviewLinkCardTriggerPrimitiveProps,
  type PreviewLinkCardPositionerProps as PreviewLinkCardPositionerPrimitiveProps,
  type PreviewLinkCardPopupProps as PreviewLinkCardPopupPrimitiveProps,
  type PreviewLinkCardImageProps as PreviewLinkCardImagePrimitiveProps,
  type PreviewLinkCardBackdropProps as PreviewLinkCardBackdropPrimitiveProps,
} from '@/registry/primitives/base/preview-link-card';
import { cn } from '@workspace/ui/lib/utils';

type PreviewLinkCardProps = PreviewLinkCardPrimitiveProps;

function PreviewLinkCard(props: PreviewLinkCardProps) {
  return <PreviewLinkCardPrimitive {...props} />;
}

type PreviewLinkCardTriggerProps = PreviewLinkCardTriggerPrimitiveProps;

function PreviewLinkCardTrigger(props: PreviewLinkCardTriggerProps) {
  return <PreviewLinkCardTriggerPrimitive {...props} />;
}

type PreviewLinkCardPanelProps = PreviewLinkCardPositionerPrimitiveProps &
  PreviewLinkCardPopupPrimitiveProps;

function PreviewLinkCardPanel({
  className,
  align = 'center',
  sideOffset = 4,
  style,
  children,
  ...props
}: PreviewLinkCardPanelProps) {
  return (
    <PreviewLinkCardPortalPrimitive>
      <PreviewLinkCardPositionerPrimitive
        align={align}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <PreviewLinkCardPopupPrimitive
          className={cn(
            'border origin-(--transform-origin) rounded-md shadow-md outline-hidden overflow-hidden',
            className,
          )}
          style={style}
        >
          {children}
        </PreviewLinkCardPopupPrimitive>
      </PreviewLinkCardPositionerPrimitive>
    </PreviewLinkCardPortalPrimitive>
  );
}

type PreviewLinkCardBackdropProps = PreviewLinkCardBackdropPrimitiveProps;

function PreviewLinkCardBackdrop(props: PreviewLinkCardBackdropProps) {
  return <PreviewLinkCardBackdropPrimitive {...props} />;
}

type PreviewLinkCardImageProps = PreviewLinkCardImagePrimitiveProps;

function PreviewLinkCardImage(props: PreviewLinkCardImageProps) {
  return <PreviewLinkCardImagePrimitive {...props} />;
}

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPanel,
  PreviewLinkCardBackdrop,
  PreviewLinkCardImage,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardPanelProps,
  type PreviewLinkCardBackdropProps,
  type PreviewLinkCardImageProps,
};
