'use client';

import * as React from 'react';

import {
  HoverCard as HoverCardPrimitive,
  HoverCardTrigger as HoverCardTriggerPrimitive,
  HoverCardContent as HoverCardContentPrimitive,
  HoverCardPortal as HoverCardPortalPrimitive,
  HoverCardArrow as HoverCardArrowPrimitive,
  type HoverCardProps as HoverCardPropsPrimitive,
  type HoverCardTriggerProps as HoverCardTriggerPropsPrimitive,
  type HoverCardContentProps as HoverCardContentPropsPrimitive,
  type HoverCardPortalProps as HoverCardPortalPropsPrimitive,
  type HoverCardArrowProps as HoverCardArrowPropsPrimitive,
} from '@/registry/primitives/radix/hover-card';
import { getStrictContext } from '@/registry/lib/get-strict-context';

type PreviewLinkCardContextType = {
  href: string;
  src?: string;
  width?: number;
  height?: number;
};

const [PreviewLinkCardProvider, usePreviewLinkCard] =
  getStrictContext<PreviewLinkCardContextType>('PreviewLinkCardContext');

type PreviewLinkCardProps = HoverCardPropsPrimitive & {
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
      <HoverCardPrimitive data-slot="preview-link-card" {...props} />
    </PreviewLinkCardProvider>
  );
}

type PreviewLinkCardTriggerProps = HoverCardTriggerPropsPrimitive & {
  href?: string;
};

function PreviewLinkCardTrigger({
  asChild,
  children,
  href: hrefProp,
  ...props
}: PreviewLinkCardTriggerProps) {
  const { href } = usePreviewLinkCard();

  return (
    <HoverCardTriggerPrimitive
      data-slot="preview-link-card-trigger"
      asChild
      {...props}
    >
      {asChild ? children : <a href={hrefProp ?? href}>{children}</a>}
    </HoverCardTriggerPrimitive>
  );
}

type PreviewLinkCardPortalProps = HoverCardPortalPropsPrimitive;

function PreviewLinkCardPortal(props: PreviewLinkCardPortalProps) {
  return (
    <HoverCardPortalPrimitive data-slot="preview-link-card-portal" {...props} />
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

type PreviewLinkCardContentProps = HoverCardContentPropsPrimitive &
  React.ComponentProps<'a'>;

function PreviewLinkCardContent({
  side = 'top',
  sideOffset = 10,
  align = 'center',
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  asChild,
  children,
  href: hrefProp,
  style,
  ...props
}: PreviewLinkCardContentProps) {
  const { href } = usePreviewLinkCard();

  return (
    <HoverCardContentPrimitive
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      arrowPadding={arrowPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      transition={transition}
      asChild={asChild}
      {...(asChild ? { style, ...props } : {})}
    >
      {asChild ? (
        children
      ) : (
        <a
          style={{
            display: 'block',
            ...style,
          }}
          href={hrefProp ?? href}
          {...props}
        >
          {children}
        </a>
      )}
    </HoverCardContentPrimitive>
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

type PreviewLinkCardArrowProps = HoverCardArrowPropsPrimitive;

function PreviewLinkCardArrow(props: PreviewLinkCardArrowProps) {
  return (
    <HoverCardArrowPrimitive data-slot="preview-link-card-arrow" {...props} />
  );
}

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPortal,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardArrow,
  usePreviewLinkCard,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardPortalProps,
  type PreviewLinkCardContentProps,
  type PreviewLinkCardImageProps,
  type PreviewLinkCardArrowProps,
  type PreviewLinkCardContextType,
};
