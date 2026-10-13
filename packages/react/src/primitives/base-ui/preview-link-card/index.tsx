'use client';

import * as React from 'react';

import { getStrictContext } from '../../../utils/strict-context';
import {
  Arrow,
  Backdrop,
  Popup,
  Portal,
  Positioner,
  Root,
  Trigger,
} from '../preview-card/preview-card';
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

type PreviewLinkCardProps = Root.Props &
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
      <Root {...props} />
    </PreviewLinkCardProvider>
  );
}

type PreviewLinkCardTriggerProps = Trigger.Props;

function PreviewLinkCardTrigger({
  href,
  ...props
}: PreviewLinkCardTriggerProps) {
  const context = usePreviewLinkCard();

  return (
    <Trigger
      data-slot="preview-link-card-trigger"
      href={href ?? context.href}
      {...props}
    />
  );
}

type PreviewLinkCardPortalProps = Portal.Props;

function PreviewLinkCardPortal(props: PreviewLinkCardPortalProps) {
  return <Portal data-slot="preview-link-card-portal" {...props} />;
}

type PreviewLinkCardPositionerProps = Positioner.Props;

function PreviewLinkCardPositioner({
  side = 'top',
  sideOffset = 10,
  align = 'center',
  ...props
}: PreviewLinkCardPositionerProps) {
  return (
    <Positioner
      data-slot="preview-link-card-positioner"
      side={side}
      sideOffset={sideOffset}
      align={align}
      {...props}
    />
  );
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

type PreviewLinkCardPopupProps = Omit<Popup.Props, keyof LinkAttributes> &
  LinkAttributes;

function PreviewLinkCardPopup({
  href,
  target,
  rel,
  download,
  hrefLang,
  ping,
  referrerPolicy,
  render,
  style,
  ...props
}: PreviewLinkCardPopupProps) {
  const context = usePreviewLinkCard();

  return (
    <Popup
      data-slot="preview-link-card-popup"
      render={
        render ?? (
          <a
            href={href ?? context.href}
            target={target}
            rel={rel}
            download={download}
            hrefLang={hrefLang}
            ping={ping}
            referrerPolicy={referrerPolicy}
          />
        )
      }
      style={
        render
          ? style
          : typeof style === 'function'
            ? (state) => ({ display: 'block', ...style(state) })
            : { display: 'block', ...style }
      }
      {...props}
    />
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

type PreviewLinkCardBackdropProps = Backdrop.Props;

function PreviewLinkCardBackdrop(props: PreviewLinkCardBackdropProps) {
  return <Backdrop data-slot="preview-link-card-backdrop" {...props} />;
}

type PreviewLinkCardArrowProps = Arrow.Props;

function PreviewLinkCardArrow(props: PreviewLinkCardArrowProps) {
  return <Arrow data-slot="preview-link-card-arrow" {...props} />;
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
