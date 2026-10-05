import {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
} from '@/registry/components/radix/preview-link-card';

interface RadixPreviewLinkCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
  href: string;
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

        <PreviewLinkCardContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          target="_blank"
        >
          <PreviewLinkCardImage alt="Animate UI Docs" />
        </PreviewLinkCardContent>
      </PreviewLinkCard>{' '}
      — hover to preview, click to dive in.
    </p>
  );
};
