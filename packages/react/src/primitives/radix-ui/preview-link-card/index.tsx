'use client';

import * as React from 'react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
  type HoverCardArrowProps,
  type HoverCardContentProps,
  type HoverCardPortalProps,
  type HoverCardProps,
  type HoverCardTriggerProps,
} from '../hover-card/hover-card';
import {
  buildPreviewSrc,
  usePreloadImage,
  type PreviewImageOptions,
} from '../../../internal/preview-link';

type PreviewLinkCardContextType = {
  href: string;
  src: string;
  width: number;
  height: number;
};

const [PreviewLinkCardProvider, usePreviewLinkCard] =
  getStrictContext<PreviewLinkCardContextType>('PreviewLinkCard');

type PreviewLinkCardProps = HoverCardProps &
  PreviewImageOptions & {
    href: string;
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
    buildPreviewSrc({ href, width, height, deviceScaleFactor, colorScheme });
  usePreloadImage(imageSrc);

  return (
    <PreviewLinkCardProvider value={{ href, src: imageSrc, width, height }}>
      <HoverCard {...props} />
    </PreviewLinkCardProvider>
  );
}

type PreviewLinkCardTriggerProps = HoverCardTriggerProps &
  React.RefAttributes<HTMLAnchorElement>;

function PreviewLinkCardTrigger({
  href,
  ...props
}: PreviewLinkCardTriggerProps) {
  const context = usePreviewLinkCard();

  return (
    <HoverCardTrigger
      data-slot="preview-link-card-trigger"
      href={href ?? context.href}
      {...props}
    />
  );
}

type PreviewLinkCardPortalProps = HoverCardPortalProps;

function PreviewLinkCardPortal(props: PreviewLinkCardPortalProps) {
  return <HoverCardPortal data-slot="preview-link-card-portal" {...props} />;
}

type LinkAttributes = Pick<
  React.ComponentProps<'a'>,
  | 'href'
  | 'target'
  | 'rel'
  | 'download'
  | 'hrefLang'
  | 'ping'
  | 'referrerPolicy'
>;

type PreviewLinkCardContentProps = Omit<
  HoverCardContentProps,
  keyof LinkAttributes
> &
  LinkAttributes &
  React.RefAttributes<HTMLAnchorElement>;

function PreviewLinkCardContent({
  side = 'top',
  sideOffset = 10,
  align = 'center',
  asChild,
  children,
  href,
  target,
  rel,
  download,
  hrefLang,
  ping,
  referrerPolicy,
  style,
  ...props
}: PreviewLinkCardContentProps) {
  const context = usePreviewLinkCard();

  return (
    <HoverCardContent
      data-slot="preview-link-card-content"
      side={side}
      sideOffset={sideOffset}
      align={align}
      style={asChild ? style : { display: 'block', ...style }}
      {...(props as HoverCardContentProps)}
      asChild
    >
      {asChild ? (
        children
      ) : (
        <a
          href={href ?? context.href}
          target={target}
          rel={rel}
          download={download}
          hrefLang={hrefLang}
          ping={ping}
          referrerPolicy={referrerPolicy}
        >
          {children}
        </a>
      )}
    </HoverCardContent>
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

  return (
    <img
      data-slot="preview-link-card-image"
      src={src}
      width={width}
      height={height}
      alt={alt}
      {...props}
    />
  );
}

type PreviewLinkCardArrowProps = HoverCardArrowProps;

function PreviewLinkCardArrow(props: PreviewLinkCardArrowProps) {
  return <HoverCardArrow data-slot="preview-link-card-arrow" {...props} />;
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
