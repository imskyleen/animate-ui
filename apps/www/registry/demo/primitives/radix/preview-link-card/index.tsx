import {
  PreviewLinkCard,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardPortal,
  PreviewLinkCardTrigger,
} from '@/registry/primitives/radix/preview-link-card';

export const RadixPreviewLinkCardDemo = () => {
  return (
    <p className="text-muted-foreground">
      Read the{' '}
      <PreviewLinkCard href="https://ui.shadcn.com">
        <PreviewLinkCardTrigger
          target="_blank"
          className="underline text-foreground"
        >
          shadcn/ui Docs
        </PreviewLinkCardTrigger>
        <PreviewLinkCardPortal>
          <PreviewLinkCardContent className="border" target="_blank">
            <PreviewLinkCardImage alt="shadcn/ui Docs" />
          </PreviewLinkCardContent>
        </PreviewLinkCardPortal>
      </PreviewLinkCard>{' '}
      — hover to preview, click to dive in.
    </p>
  );
};
