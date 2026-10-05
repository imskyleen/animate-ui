'use client';

import { Tooltip as RadixTooltip } from '@animate-ui/react/primitives/radix-ui/tooltip';
import { HoverCard as RadixHoverCard } from '@animate-ui/react/primitives/radix-ui/hover-card';
import { Tooltip as BaseTooltip } from '@animate-ui/react/primitives/base-ui/tooltip';
import { PreviewCard as BasePreviewCard } from '@animate-ui/react/primitives/base-ui/preview-card';

const trigger =
  'flex h-12 w-72 items-center justify-center rounded-md border text-sm';
const popup = 'rounded-md border bg-background px-3 py-1.5 text-sm';

// Animate UI v1's `followCursor` on the Radix UI Tooltip and HoverCard and
// the Base UI Tooltip and PreviewCard.
export default function FollowCursorFixture() {
  return (
    <div className="flex flex-col items-start gap-16 pt-16">
      <RadixTooltip.Provider delayDuration={0}>
        <RadixTooltip.Root followCursor>
          <RadixTooltip.Trigger className={trigger}>
            Radix both
          </RadixTooltip.Trigger>
          <RadixTooltip.Portal>
            <RadixTooltip.Content className={popup} data-testid="radix-both">
              Following
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        </RadixTooltip.Root>

        <RadixTooltip.Root followCursor="x">
          <RadixTooltip.Trigger className={trigger}>
            Radix x
          </RadixTooltip.Trigger>
          <RadixTooltip.Portal>
            <RadixTooltip.Content className={popup} data-testid="radix-x">
              Following x
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>

      <RadixHoverCard.Root followCursor openDelay={0} closeDelay={0}>
        <RadixHoverCard.Trigger className={trigger} href="#">
          Radix card
        </RadixHoverCard.Trigger>
        <RadixHoverCard.Portal>
          <RadixHoverCard.Content className={popup} data-testid="radix-card">
            Card
          </RadixHoverCard.Content>
        </RadixHoverCard.Portal>
      </RadixHoverCard.Root>

      <BaseTooltip.Provider delay={0}>
        <BaseTooltip.Root followCursor>
          <BaseTooltip.Trigger className={trigger}>
            Base both
          </BaseTooltip.Trigger>
          <BaseTooltip.Portal>
            <BaseTooltip.Positioner sideOffset={8}>
              <BaseTooltip.Popup className={popup} data-testid="base-both">
                Following
              </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
          </BaseTooltip.Portal>
        </BaseTooltip.Root>
      </BaseTooltip.Provider>

      <BasePreviewCard.Root followCursor>
        <BasePreviewCard.Trigger className={trigger} href="#" delay={0}>
          Base card
        </BasePreviewCard.Trigger>
        <BasePreviewCard.Portal>
          <BasePreviewCard.Positioner sideOffset={8}>
            <BasePreviewCard.Popup className={popup} data-testid="base-card">
              Card
            </BasePreviewCard.Popup>
          </BasePreviewCard.Positioner>
        </BasePreviewCard.Portal>
      </BasePreviewCard.Root>
    </div>
  );
}
