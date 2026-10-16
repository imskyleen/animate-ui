'use client';

import { useScrollFade } from '@animate-ui/react/primitives/effects/scroll-fade';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { TextAlignLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TOCItem, type TOCItemType } from 'fumadocs-core/toc';
import {
  TOCScrollArea,
  useActiveAnchors,
  useTOCItems,
} from 'fumadocs-ui/components/toc';
import type { TOCProps } from 'fumadocs-ui/layouts/docs/page/slots/toc';
import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';

import {
  AnimatedNav,
  indicatorTransition,
  NavItemContent,
  useNavHover,
} from './animated-nav';

function Item({ item, active }: { item: TOCItemType; active: boolean }) {
  const { hovered, hoverProps } = useNavHover(item.url);
  return (
    <TOCItem
      href={item.url}
      data-toc-item={item.url}
      className="relative flex items-center py-1.5 pr-1 pl-4 text-start [overflow-wrap:anywhere]"
      {...hoverProps}
    >
      <NavItemContent
        active={active}
        hovered={hovered}
        activeBar={false}
        depth={Math.max(0, item.depth - 2)}
      >
        {item.title}
      </NavItemContent>
    </TOCItem>
  );
}

type Range = { top: number; height: number } | null;

function RangeBar({
  list,
  active,
}: {
  list: React.RefObject<HTMLDivElement | null>;
  active: string[];
}) {
  const reduce = useShouldReduceMotion();
  const [range, setRange] = useState<Range>(null);

  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const measure = () => {
      const items = active.flatMap((id) => {
        const item = element.querySelector<HTMLElement>(
          `[data-toc-item="#${CSS.escape(id)}"]`,
        );
        return item ? [item] : [];
      });
      if (items.length === 0) return setRange(null);
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const top = first.offsetTop + first.offsetHeight * 0.22;
      const bottom = last.offsetTop + last.offsetHeight * 0.78;
      setRange({ top, height: bottom - top });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [list, active]);

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute top-0 left-[8px] z-11 w-[3px] rounded-full bg-primary"
      initial={false}
      animate={
        range
          ? { y: range.top, height: range.height, opacity: 1 }
          : { opacity: 0 }
      }
      transition={reduce ? { duration: 0 } : indicatorTransition}
    />
  );
}

export function TOC({ container }: TOCProps) {
  const items = useTOCItems();
  const active = useActiveAnchors();
  const list = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  useScrollFade(scroll, { size: 24, blur: 0 });

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
      <TOCScrollArea
        ref={scroll}
        className="overscroll-none px-0 pt-0 mask-none"
      >
        <AnimatedNav>
          <div ref={list} className="relative ml-2 flex flex-col">
            <RangeBar list={list} active={active} />
            {items.map((item) => (
              <Item
                key={item.url}
                item={item}
                active={active.includes(item.url.slice(1))}
              />
            ))}
          </div>
        </AnimatedNav>
      </TOCScrollArea>
    </div>
  );
}
