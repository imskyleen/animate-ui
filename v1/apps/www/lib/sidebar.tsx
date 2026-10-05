'use client';

import { Component, Cuboid } from 'lucide-react';
import { LucideIcons } from '@/components/icons/lucide-icons';
import { cn } from '@workspace/ui/lib/utils';
import { index } from '@/__registry__';
import { Dancing_Script } from 'next/font/google';

const dancing = Dancing_Script({ subsets: ['latin'] });

const TabsDescription = ({
  title,
  count,
}: {
  title: string;
  count: number;
}) => {
  return (
    <span className="flex items-center flex-row gap-2">
      <span>{title}</span>
      <span className="pt-0.5 pb-px px-1.5 font-semibold rounded-full bg-foreground/10 text-[10px] text-foreground/50">
        {count}
      </span>
    </span>
  );
};

export const SIDEBAR_TABS = [
  {
    title: 'Components',
    description: (
      <TabsDescription
        title="Animated Components"
        count={
          Object.values(index).filter((item) =>
            item.name.startsWith('components-'),
          ).length
        }
      />
    ),
    icon: (
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <Component />
      </div>
    ),
    url: '/docs/components',
  },
  {
    title: 'Primitives',
    description: (
      <TabsDescription
        title="Animated Primitives"
        count={
          Object.values(index).filter((item) =>
            item.name.startsWith('primitives-'),
          ).length
        }
      />
    ),
    icon: (
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <Cuboid />
      </div>
    ),
    url: '/docs/primitives',
  },
  {
    title: (
      <span>
        Icons{' '}
        <span
          className={cn(
            dancing.className,
            'text-sm ml-2 text-blue-600 dark:text-blue-400',
          )}
        >
          beta
        </span>
      </span>
    ),
    description: (
      <TabsDescription
        title="Animated Icons"
        count={
          Object.values(index).filter(
            (item) =>
              item.name.startsWith('icons-') && item.name !== 'icons-icon',
          ).length
        }
      />
    ),
    icon: (
      <div className="[&_svg]:size-full rounded-lg size-full text-muted-foreground max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5">
        <LucideIcons />
      </div>
    ),
    url: '/docs/icons',
  },
];
