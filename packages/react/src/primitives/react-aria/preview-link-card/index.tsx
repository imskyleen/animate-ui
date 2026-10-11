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

// Animate UI's Preview Link Card, on React Aria's PreviewTrigger: hovering a
// link (or focusing it, or long-pressing it) shows a screenshot of the page
// it leads to, and the card is itself a link there. v1 had no React Aria
// version: it has the parts of the Radix UI and Base UI ones, the React Aria
// way (no Portal: the Popover portals itself; `placement` and `offset`;
// `isOpen`). The card is Animate UI's Popover under a PreviewTrigger, so it
// moves exactly like the React Aria hover card: it grows from 0.8 and fades
// in from the link on a spring, and shrinks back the same way.
//
// The screenshot comes from Microlink's API (as in v1) unless `src` is given,
// and is preloaded as soon as the card mounts, so it's there when it opens.

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
    /** The page the link leads to, and the one the screenshot shows. */
    href: string;
  };

/** React Aria's PreviewTrigger: holds the trigger and the popover. */
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

/** React Aria's Link, to the card's `href`. */
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

/** The attributes of the card's link (the rest goes to the Popover). */
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

/**
 * The card: Animate UI's Popover (the animated element, so its className
 * styles the card), filled with a React Aria Link to the card's `href`.
 */
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

/** The screenshot, at the card's `width` and `height`. */
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
