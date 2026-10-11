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

// Animate UI v1's Preview Link Card, on Radix UI's HoverCard: hovering a link
// shows a screenshot of the page it leads to, and the card is itself a link
// there. It is Animate UI's HoverCard, so the card moves exactly like it:
// it grows from 0.8 and fades in from the trigger on a spring, and shrinks
// back the same way.
//
// The screenshot comes from Microlink's API (as in v1) unless `src` is given,
// and is preloaded as soon as the Root mounts, so it's there when the card
// opens.

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
    /** The page the link leads to, and the one the screenshot shows. */
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

/** Radix's Trigger is a link: it leads to the Root's `href`. */
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

/** The attributes of the card's link (the rest goes to the card itself). */
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

/**
 * The card: a link to the Root's `href`, rendered as Radix's Content (it is
 * the animated element, so its className styles the card). With `asChild`,
 * the child is rendered instead, as in v1.
 */
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

/** The screenshot, at the Root's `width` and `height`. */
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
