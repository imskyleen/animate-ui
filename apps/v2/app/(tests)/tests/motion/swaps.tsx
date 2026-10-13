'use client';

import { CopyButton } from '@/components/docs/copy-button';
import { ThemeToggle } from '@/components/layout/header';

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
