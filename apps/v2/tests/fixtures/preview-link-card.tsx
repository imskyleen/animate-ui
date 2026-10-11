'use client';

import * as Radix from '@animate-ui/react/primitives/radix-ui/preview-link-card';
import * as Base from '@animate-ui/react/primitives/base-ui/preview-link-card';
import * as Aria from '@animate-ui/react/primitives/react-aria/preview-link-card';

// The Preview Link Card's own props, in each library: an image of your own
// (`src`), and the screenshot's options (size, scale, color scheme).

const CUSTOM_SRC = 'https://screenshots.test/custom.svg';
const SCREENSHOT = {
  href: 'https://example.com/',
  width: 320,
  height: 180,
  deviceScaleFactor: 2,
  colorScheme: 'dark',
} as const;

function RadixCard({
  testId,
  ...props
}: Radix.PreviewLinkCardProps & { testId: string }) {
  return (
    <Radix.PreviewLinkCard openDelay={0} closeDelay={0} {...props}>
      <Radix.PreviewLinkCardTrigger>{testId} link</Radix.PreviewLinkCardTrigger>
      <Radix.PreviewLinkCardPortal>
        <Radix.PreviewLinkCardContent data-testid={testId} side="right">
          <Radix.PreviewLinkCardImage alt={`${testId} image`} />
        </Radix.PreviewLinkCardContent>
      </Radix.PreviewLinkCardPortal>
    </Radix.PreviewLinkCard>
  );
}

function BaseCard({
  testId,
  ...props
}: Base.PreviewLinkCardProps & { testId: string }) {
  return (
    <Base.PreviewLinkCard {...props}>
      <Base.PreviewLinkCardTrigger delay={0} closeDelay={0}>
        {testId} link
      </Base.PreviewLinkCardTrigger>
      <Base.PreviewLinkCardPortal>
        <Base.PreviewLinkCardPositioner side="right">
          <Base.PreviewLinkCardPopup data-testid={testId}>
            <Base.PreviewLinkCardImage alt={`${testId} image`} />
          </Base.PreviewLinkCardPopup>
        </Base.PreviewLinkCardPositioner>
      </Base.PreviewLinkCardPortal>
    </Base.PreviewLinkCard>
  );
}

function AriaCard({
  testId,
  ...props
}: Omit<Aria.PreviewLinkCardProps, 'children'> & { testId: string }) {
  return (
    <Aria.PreviewLinkCard delay={0} closeDelay={0} {...props}>
      <Aria.PreviewLinkCardTrigger>{testId} link</Aria.PreviewLinkCardTrigger>
      <Aria.PreviewLinkCardPopover data-testid={testId} placement="end">
        <Aria.PreviewLinkCardImage alt={`${testId} image`} />
      </Aria.PreviewLinkCardPopover>
    </Aria.PreviewLinkCard>
  );
}

export default function PreviewLinkCardFixture() {
  return (
    <div className="flex flex-col items-start gap-16">
      <RadixCard
        testId="radix-ui-src"
        href="https://example.com/"
        src={CUSTOM_SRC}
      />
      <RadixCard testId="radix-ui-options" {...SCREENSHOT} />
      <BaseCard
        testId="base-ui-src"
        href="https://example.com/"
        src={CUSTOM_SRC}
      />
      <BaseCard testId="base-ui-options" {...SCREENSHOT} />
      <AriaCard
        testId="react-aria-src"
        href="https://example.com/"
        src={CUSTOM_SRC}
      />
      <AriaCard testId="react-aria-options" {...SCREENSHOT} />
    </div>
  );
}
