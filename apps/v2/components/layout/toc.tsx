'use client';

import { TextAlignLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TOCItem, type TOCItemType } from 'fumadocs-core/toc';
import {
  TOCScrollArea,
  useActiveAnchor,
  useTOCItems,
} from 'fumadocs-ui/components/toc';
import type { TOCProps } from 'fumadocs-ui/layouts/docs/page/slots/toc';

import { AnimatedNav, NavItemContent, useNavHover } from './animated-nav';

function Item({ item, active }: { item: TOCItemType; active: boolean }) {
  const { hovered, hoverProps } = useNavHover(item.url);
  return (
    <TOCItem
      href={item.url}
      className="relative flex items-center py-1.5 pl-4 text-start [overflow-wrap:anywhere]"
      {...hoverProps}
    >
      <NavItemContent
        active={active}
        hovered={hovered}
        depth={Math.max(0, item.depth - 2)}
      >
        {item.title}
      </NavItemContent>
    </TOCItem>
  );
}

// `slots.toc.main` of DocsPage: Fumadocs' placement and scroll spy, the
// sidebar's look (section title, line and gliding bars).
export function TOC({ container }: TOCProps) {
  const items = useTOCItems();
  // The first heading in view: one active bar, like the sidebar.
  const active = useActiveAnchor();

  if (items.length === 0)
    return (
      <div
        id="nd-toc-placeholder"
        className="hidden xl:layout:[--fd-toc-width:268px]"
      />
    );

  return (
    <div
      id="nd-toc"
      {...container}
      className="sticky top-(--fd-docs-row-1) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) flex-col pt-7 pe-4 pb-2 [grid-area:toc] max-xl:hidden xl:layout:[--fd-toc-width:268px]"
    >
      <p className="mb-2 flex items-center gap-2 px-2">
        <span className="relative flex size-5 items-center justify-center rounded-[5px] bg-border text-muted-foreground">
          <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} size={12} />
          <span className="absolute top-full left-1/2 h-2 w-px translate-x-[calc(-50%-0.5px)] bg-border" />
        </span>
        <span className="text-[13px] text-neutral-500">On this page</span>
      </p>
      <TOCScrollArea className="px-2 pt-0">
        <AnimatedNav>
          <div className="ml-2 flex flex-col">
            {items.map((item) => (
              <Item
                key={item.url}
                item={item}
                active={item.url === `#${active}`}
              />
            ))}
          </div>
        </AnimatedNav>
      </TOCScrollArea>
    </div>
  );
}
