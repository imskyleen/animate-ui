import {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPanel,
  PreviewLinkCardImage,
} from '@/registry/components/base/preview-link-card';

interface BasePreviewLinkCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
  href: string;
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
        <PreviewLinkCardPanel
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          target="_blank"
        >
          <PreviewLinkCardImage alt="Animate UI Docs" />
        </PreviewLinkCardPanel>
      </PreviewLinkCard>{' '}
      — hover to preview, click to dive in.
    </p>
  );
};
