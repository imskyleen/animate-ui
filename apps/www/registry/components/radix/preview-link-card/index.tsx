import * as React from 'react';

import {
  PreviewLinkCard as PreviewLinkCardPrimitive,
  PreviewLinkCardTrigger as PreviewLinkCardTriggerPrimitive,
  PreviewLinkCardPortal as PreviewLinkCardPortalPrimitive,
  PreviewLinkCardContent as PreviewLinkCardContentPrimitive,
  PreviewLinkCardImage as PreviewLinkCardImagePrimitive,
  type PreviewLinkCardProps as PreviewLinkCardPrimitiveProps,
  type PreviewLinkCardTriggerProps as PreviewLinkCardTriggerPrimitiveProps,
  type PreviewLinkCardContentProps as PreviewLinkCardContentPrimitiveProps,
  type PreviewLinkCardImageProps as PreviewLinkCardImagePrimitiveProps,
} from '@/registry/primitives/radix/preview-link-card';
import { cn } from '@workspace/ui/lib/utils';

type PreviewLinkCardProps = PreviewLinkCardPrimitiveProps;

function PreviewLinkCard(props: PreviewLinkCardProps) {
  return <PreviewLinkCardPrimitive {...props} />;
}

type PreviewLinkCardTriggerProps = PreviewLinkCardTriggerPrimitiveProps;

function PreviewLinkCardTrigger(props: PreviewLinkCardTriggerProps) {
  return <PreviewLinkCardTriggerPrimitive {...props} />;
}

type PreviewLinkCardContentProps = PreviewLinkCardContentPrimitiveProps;

function PreviewLinkCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: PreviewLinkCardContentProps) {
  return (
    <PreviewLinkCardPortalPrimitive>
      <PreviewLinkCardContentPrimitive
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 origin-(--radix-hover-card-content-transform-origin) rounded-md border shadow-md outline-hidden overflow-hidden',
          className,
        )}
        {...props}
      />
    </PreviewLinkCardPortalPrimitive>
  );
}

type PreviewLinkCardImageProps = PreviewLinkCardImagePrimitiveProps;

function PreviewLinkCardImage(props: PreviewLinkCardImageProps) {
  return <PreviewLinkCardImagePrimitive {...props} />;
}

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardContentProps,
  type PreviewLinkCardImageProps,
};
