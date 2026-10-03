import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardPopup,
} from '@/registry/primitives/base/preview-card';

interface PreviewCardDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  followCursor?: boolean | 'x' | 'y';
}

export const PreviewCardDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
  followCursor,
}: PreviewCardDemoProps) => {
  return (
    <PreviewCard followCursor={followCursor}>
      <PreviewCardTrigger
        render={
          <a
            className="size-12 border"
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
      <PreviewCardPortal>
        <PreviewCardPositioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          className="z-50"
        >
          <PreviewCardPopup className="w-80 bg-background border p-4">
            <div className="flex flex-col gap-4">
              <img
                className="size-16 rounded-full overflow-hidden border"
                src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
                alt="Animate UI"
              />
              <div className="flex flex-col gap-4">
                <div>
                  <div className="font-bold">Animate UI</div>
                  <div className="text-sm text-muted-foreground">
                    @animate_ui
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  A fully animated, open-source component distribution built
                  with React, TypeScript, Tailwind CSS, and Motion.
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
          </PreviewCardPopup>
        </PreviewCardPositioner>
      </PreviewCardPortal>
    </PreviewCard>
  );
};
