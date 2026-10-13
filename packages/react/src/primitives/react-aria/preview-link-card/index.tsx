'use client';

import * as React from 'react';
import {
  Link,
  PreviewTrigger,
  type LinkProps,
  type PreviewTriggerProps,
} from 'react-aria-components';

import { getStrictContext } from '../../../utils/strict-context';
import { Popover, type PopoverProps } from '../popover';
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

type PreviewLinkCardProps = PreviewTriggerProps &
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
      <PreviewTrigger {...props} />
    </PreviewLinkCardProvider>
  );
}

type PreviewLinkCardTriggerProps = LinkProps &
  React.RefAttributes<HTMLAnchorElement>;

function PreviewLinkCardTrigger({
  href,
  ...props
}: PreviewLinkCardTriggerProps) {
  const context = usePreviewLinkCard();

  return (
    <Link
      data-slot="preview-link-card-trigger"
      href={href ?? context.href}
      {...props}
    />
  );
}

type LinkAttributes = Pick<
  LinkProps,
  | 'href'
  | 'target'
  | 'rel'
  | 'download'
  | 'hrefLang'
  | 'ping'
  | 'referrerPolicy'
>;

type PreviewLinkCardPopoverProps = Omit<
  PopoverProps,
  keyof LinkAttributes | 'children'
> &
  LinkAttributes & {
    children?: React.ReactNode;
  };

function PreviewLinkCardPopover({
  placement = 'top',
  offset = 10,
  href,
  target,
  rel,
  download,
  hrefLang,
  ping,
  referrerPolicy,
  children,
  ...props
}: PreviewLinkCardPopoverProps) {
  const context = usePreviewLinkCard();

  return (
    <Popover
      data-slot="preview-link-card-popover"
      placement={placement}
      offset={offset}
      {...props}
    >
      <Link
        data-slot="preview-link-card-link"
        href={href ?? context.href}
        target={target}
        rel={rel}
        download={download}
        hrefLang={hrefLang}
        ping={ping}
        referrerPolicy={referrerPolicy}
        style={{ display: 'block' }}
      >
        {children}
      </Link>
    </Popover>
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

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPopover,
  PreviewLinkCardImage,
  usePreviewLinkCard,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardPopoverProps,
  type PreviewLinkCardImageProps,
  type PreviewLinkCardContextType,
};
