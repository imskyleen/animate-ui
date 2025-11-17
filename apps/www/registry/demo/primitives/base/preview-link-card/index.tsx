import {
  PreviewLinkCard,
  PreviewLinkCardImage,
  PreviewLinkCardPortal,
  PreviewLinkCardTrigger,
  PreviewLinkCardPositioner,
  PreviewLinkCardPopup,
} from '@/registry/primitives/base/preview-link-card';

interface BasePreviewLinkCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
  href: string;
  gravity?: number | false;
}

export const BasePreviewLinkCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
  href,
}: BasePreviewLinkCardDemoProps) => {
  return (
    <p className="text-muted-foreground">
      Read the{' '}
      <PreviewLinkCard href={href} followCursor={followCursor}>
        <PreviewLinkCardTrigger
          target="_blank"
          className="underline text-foreground"
        >
          Animate UI Docs
        </PreviewLinkCardTrigger>
        <PreviewLinkCardPortal>
          <PreviewLinkCardPositioner
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className="z-50"
          >
            <PreviewLinkCardPopup className="border" target="_blank">
              <PreviewLinkCardImage alt="Animate UI Docs" />
            </PreviewLinkCardPopup>
          </PreviewLinkCardPositioner>
        </PreviewLinkCardPortal>
      </PreviewLinkCard>{' '}
      — hover to preview, click to dive in.
    </p>
  );
};
