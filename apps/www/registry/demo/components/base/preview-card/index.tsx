import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPanel,
} from '@/registry/components/base/preview-card';

interface BasePreviewCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
}

export const BasePreviewCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: BasePreviewCardDemoProps) => {
  return (
    <PreviewCard followCursor={followCursor}>
      <PreviewCardTrigger
        render={
          <a
            className="size-12 border rounded-full overflow-hidden"
            href="https://twitter.com/animate_ui"
            target="_blank"
            rel="noreferrer noopener"
          >
            <img
              src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
              alt="Animate UI"
            />
          </a>
        }
      />

      <PreviewCardPanel
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-80"
      >
        <div className="flex flex-col gap-4">
          <img
            className="size-16 rounded-full overflow-hidden border"
            src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
            alt="Animate UI"
          />
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-bold">Animate UI</div>
              <div className="text-sm text-muted-foreground">@animate_ui</div>
            </div>
            <div className="text-sm text-muted-foreground">
              A fully animated, open-source component distribution built with
              React, TypeScript, Tailwind CSS, and Motion.
            </div>
            <div className="flex gap-4">
              <div className="flex gap-1 text-sm items-center">
                <div className="font-bold">0</div>{' '}
                <div className="text-muted-foreground">Following</div>
              </div>
              <div className="flex gap-1 text-sm items-center">
                <div className="font-bold">2,900</div>{' '}
                <div className="text-muted-foreground">Followers</div>
              </div>
            </div>
          </div>
        </div>
      </PreviewCardPanel>
    </PreviewCard>
  );
};
