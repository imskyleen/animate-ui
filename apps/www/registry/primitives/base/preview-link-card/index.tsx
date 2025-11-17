'use client';

import * as React from 'react';

import {
  PreviewCard as PreviewCardPrimitive,
  PreviewCardTrigger as PreviewCardTriggerPrimitive,
  PreviewCardPortal as PreviewCardPortalPrimitive,
  PreviewCardArrow as PreviewCardArrowPrimitive,
  PreviewCardPositioner as PreviewCardPositionerPrimitive,
  PreviewCardPopup as PreviewCardPopupPrimitive,
  PreviewCardBackdrop as PreviewCardBackdropPrimitive,
  type PreviewCardProps as PreviewCardPropsPrimitive,
  type PreviewCardTriggerProps as PreviewCardTriggerPropsPrimitive,
  type PreviewCardPortalProps as PreviewCardPortalPropsPrimitive,
  type PreviewCardPositionerProps as PreviewCardPositionerPropsPrimitive,
  type PreviewCardPopupProps as PreviewCardPopupPropsPrimitive,
  type PreviewCardArrowProps as PreviewCardArrowPropsPrimitive,
  type PreviewCardBackdropProps as PreviewCardBackdropPropsPrimitive,
} from '@/registry/primitives/base/preview-card';
import { getStrictContext } from '@/registry/lib/get-strict-context';

type PreviewLinkCardContextType = {
  href: string;
  src?: string;
  width?: number;
  height?: number;
};

const [PreviewLinkCardProvider, usePreviewLinkCard] =
  getStrictContext<PreviewLinkCardContextType>('PreviewLinkCardContext');

type PreviewLinkCardProps = PreviewCardPropsPrimitive & {
  href: string;
  src?: string;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  colorScheme?: 'light' | 'dark';
};

function PreviewLinkCard({
  href,
  src,
  width = 240,
  height = 135,
  deviceScaleFactor = 1,
  colorScheme = 'light',
  ...props
}: PreviewLinkCardProps) {
  const imageSrc =
    src ??
    `https://api.microlink.io/?${buildQueryString({
      url: href,
      screenshot: true,
      meta: false,
      embed: 'screenshot.url',
      colorScheme,
      'viewport.isMobile': true,
      'viewport.deviceScaleFactor': deviceScaleFactor,
      'viewport.width': width * 3,
      'viewport.height': height * 3,
    })}`;

  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [imageSrc]);

  return (
    <PreviewLinkCardProvider value={{ href, src: imageSrc, width, height }}>
      <PreviewCardPrimitive data-slot="preview-link-card" {...props} />
    </PreviewLinkCardProvider>
  );
}

type PreviewLinkCardTriggerProps = PreviewCardTriggerPropsPrimitive &
  React.ComponentProps<'a'>;

function PreviewLinkCardTrigger({
  children,
  href: hrefProp,
  render,
  ...props
}: PreviewLinkCardTriggerProps) {
  const { href } = usePreviewLinkCard();

  return (
    <PreviewCardTriggerPrimitive
      data-slot="preview-link-card-trigger"
      render={render ?? <a href={hrefProp ?? href}>{children}</a>}
      {...props}
    />
  );
}

type PreviewLinkCardPortalProps = PreviewCardPortalPropsPrimitive;

function PreviewLinkCardPortal(props: PreviewLinkCardPortalProps) {
  return (
    <PreviewCardPortalPrimitive
      data-slot="preview-link-card-portal"
      {...props}
    />
  );
}

type PreviewLinkCardPositionerProps = PreviewCardPositionerPropsPrimitive;

function PreviewLinkCardPositioner({
  side = 'top',
  sideOffset = 10,
  align = 'center',
  ...props
}: PreviewLinkCardPositionerProps) {
  return (
    <PreviewCardPositionerPrimitive
      data-slot="preview-link-card-positioner"
      side={side}
      sideOffset={sideOffset}
      align={align}
      {...props}
    />
  );
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.append(k, String(v));
  }
  return sp.toString();
}

type PreviewLinkCardPopupProps = PreviewCardPopupPropsPrimitive &
  React.ComponentProps<'a'>;

function PreviewLinkCardPopup({
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  href: hrefProp,
  style,
  children,
  ...props
}: PreviewLinkCardPopupProps) {
  const { href } = usePreviewLinkCard();

  return (
    <PreviewCardPopupPrimitive
      data-slot="preview-link-card-popup"
      transition={transition}
    >
      <a
        data-slot="preview-link-card-popup-link"
        style={{
          display: 'block',
          ...style,
        }}
        href={hrefProp ?? href}
        {...props}
      >
        {children}
      </a>
    </PreviewCardPopupPrimitive>
  );
}

type PreviewLinkCardImageProps = Omit<
  React.ComponentProps<'img'>,
  'src' | 'width' | 'height'
>;

function PreviewLinkCardImage({
  alt = 'preview image',
  ...props
}: PreviewLinkCardImageProps) {
  const { src, width, height } = usePreviewLinkCard();

  return <img src={src} width={width} height={height} alt={alt} {...props} />;
}

type PreviewLinkCardBackdropProps = PreviewCardBackdropPropsPrimitive;

function PreviewLinkCardBackdrop(props: PreviewLinkCardBackdropProps) {
  return (
    <PreviewCardBackdropPrimitive
      data-slot="preview-link-card-backdrop"
      {...props}
    />
  );
}

type PreviewLinkCardArrowProps = PreviewCardArrowPropsPrimitive;

function PreviewLinkCardArrow(props: PreviewLinkCardArrowProps) {
  return (
    <PreviewCardArrowPrimitive data-slot="preview-link-card-arrow" {...props} />
  );
}

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPortal,
  PreviewLinkCardPositioner,
  PreviewLinkCardPopup,
  PreviewLinkCardImage,
  PreviewLinkCardBackdrop,
  PreviewLinkCardArrow,
  usePreviewLinkCard,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardPortalProps,
  type PreviewLinkCardPositionerProps,
  type PreviewLinkCardPopupProps,
  type PreviewLinkCardImageProps,
  type PreviewLinkCardBackdropProps,
  type PreviewLinkCardArrowProps,
  type PreviewLinkCardContextType,
};
