'use client';

import * as React from 'react';

import {
  PageTransition,
  PageTransitionShared,
  type PageTransitionEffect,
} from '@/registry/components/page-transition';

const EFFECTS: PageTransitionEffect[] = [
  'fade',
  'slide',
  'push',
  'zoom',
  'iris',
  'wipe',
  'bands',
  'stack',
  'flow',
  'chop',
  'random',
];

const PAGES = [
  {
    title: 'Home',
    text: 'Animated primitives for Radix UI, Base UI and React Aria.',
    tone: 'bg-sky-100 dark:bg-sky-950',
  },
  {
    title: 'Docs',
    text: 'Swap the import and your shadcn/ui components animate.',
    tone: 'bg-amber-100 dark:bg-amber-950',
  },
  {
    title: 'Blog',
    text: 'Animate UI 2.0 is out, with a CLI and a skill.',
    tone: 'bg-emerald-100 dark:bg-emerald-950',
  },
];

export default function PageTransitionFixture() {
  const [effect, setEffect] = React.useState<PageTransitionEffect>('fade');
  const [page, setPage] = React.useState(0);

  const go = (next: number) => {
    if (next === page) return;
    React.startTransition(() => {
      React.addTransitionType(next > page ? 'nav-forward' : 'nav-back');
      setPage(next);
    });
  };

  const current = PAGES[page]!;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Effect"
      >
        {EFFECTS.map((name) => (
          <button
            key={name}
            role="radio"
            aria-checked={effect === name}
            onClick={() => setEffect(name)}
            className="rounded-md border px-3 py-1.5 text-sm aria-checked:bg-foreground aria-checked:text-background"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <nav className="flex gap-1 border-b p-2">
          {PAGES.map((item, index) => (
            <button
              key={item.title}
              onClick={() => go(index)}
              aria-current={index === page ? 'page' : undefined}
              className="rounded-md px-3 py-1.5 text-sm aria-[current=page]:bg-accent"
            >
              {item.title}
            </button>
          ))}
        </nav>
        <PageTransition
          effect={effect}
          pageKey={page}
          className={`relative flex h-80 flex-col justify-end gap-2 p-8 ${current.tone}`}
        >
          {page < 2 && (
            <PageTransitionShared
              name="cover"
              className={
                page === 0
                  ? 'absolute top-8 right-8 size-20 rounded-2xl bg-foreground'
                  : 'absolute inset-x-8 top-8 h-24 rounded-lg bg-foreground'
              }
            />
          )}
          <h1 className="text-4xl font-medium">{current.title}</h1>
          <p className="text-muted-foreground">{current.text}</p>
        </PageTransition>
      </div>
    </div>
  );
}
