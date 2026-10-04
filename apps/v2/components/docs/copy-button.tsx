'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Animate UI's copy button, as in v1: the press scales the button, the icon
 * swaps with a blur. `getText` reads what to copy at click time.
 */
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
      hoverScale={1.05}
      tapScale={0.92}
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
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? 'check' : 'copy'}
          data-slot="copy-button-icon"
          className="flex"
          initial={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            strokeWidth={2}
            size={14}
          />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

/** The text of the first `<pre>` in `container`, as Fumadocs copies it. */
export function getPreText(container: HTMLElement | null | undefined) {
  const pre = container?.getElementsByTagName('pre').item(0);
  if (!pre) return undefined;
  const clone = pre.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
    node.replaceWith('\n');
  });
  return clone.textContent ?? '';
}
