'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from 'cn';
import { useEffect, useRef, useState } from 'react';

import { IconSwap } from './icon-swap';

export function CopyButton({
  getText,
  className,
  delay = 2000,
}: {
  getText: () => string | undefined;
  className?: string;
  delay?: number;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <Button
      type="button"
      data-slot="copy-button"
      aria-label={copied ? 'Copied' : 'Copy code'}
      onClick={() => {
        const text = getText();
        if (text === undefined) return;
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setCopied(false), delay);
        });
      }}
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-black/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 dark:hover:bg-white/10',
        className,
      )}
    >
      <IconSwap
        active={copied}
        icon={Copy01Icon}
        activeIcon={Tick02Icon}
        size={14}
      />
    </Button>
  );
}

export function getPreText(container: HTMLElement | null | undefined) {
  const pre = container?.getElementsByTagName('pre').item(0);
  if (!pre) return undefined;
  const clone = pre.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
    node.replaceWith('\n');
  });
  return clone.textContent ?? '';
}
