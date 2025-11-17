import {
  PreviewLinkCard,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardPortal,
  PreviewLinkCardTrigger,
} from '@/registry/primitives/radix/preview-link-card';

interface RadixPreviewLinkCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
  href: string;
  gravity?: number | false;
}

export const RadixPreviewLinkCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
  href,
}: RadixPreviewLinkCardDemoProps) => {
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
          <PreviewLinkCardContent
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className="z-50 border"
            target="_blank"
          >
            <PreviewLinkCardImage alt="Animate UI Docs" />
          </PreviewLinkCardContent>
        </PreviewLinkCardPortal>
      </PreviewLinkCard>{' '}
      — hover to preview, click to dive in.
    </p>
  );
};
