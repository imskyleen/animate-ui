'use client';

import { CopyButton } from '@/components/docs/copy-button';
import { ThemeToggle } from '@/components/layout/header';

// The docs' own icon swaps, live on the motion review page (a server page
// can't hand `getText` to the copy button itself).

export function CopySwap() {
  return (
    <CopyButton
      getText={() => 'pnpm dlx shadcn@latest add @animate-ui/radix-ui-tooltip'}
      className="size-9 bg-accent"
    />
  );
}

export function ThemeSwap() {
  return <ThemeToggle className="size-9 bg-accent" />;
}
