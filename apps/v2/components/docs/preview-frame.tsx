'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  ReducedMotionConfig,
  useMotionTokens,
} from '@animate-ui/react/utils/motion';
import { RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { InCodeTabsContext } from './codeblock';
import { CopyButton, getPreText } from './copy-button';

const COLLAPSED_HEIGHT = 160;

/**
 * The demo, then its code below it (like shadcn/ui): collapsed to a few
 * lines behind a "View code" button, which unfolds the rest. Both sit in
 * Animate UI's accent frame; the replay button remounts the demo.
 */
export function PreviewFrame({
  children,
  code,
  fullBleed = false,
}: {
  children: ReactNode;
  code: ReactNode;
  fullBleed?: boolean;
}) {
  const [run, setRun] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { transition } = useMotionTokens();
  // Short code shows whole, without the button.
  const [fits, setFits] = useState(false);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () =>
      setFits(content.scrollHeight <= COLLAPSED_HEIGHT + 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  const open = expanded || fits;

  return (
    <ReducedMotionConfig>
      <div className="not-prose my-6 flex flex-col gap-1 rounded-xl bg-accent p-1 first:mt-0">
        <div
          data-slot="preview"
          className={cn(
            'relative flex items-center justify-center rounded-lg bg-background',
            fullBleed
              ? 'h-[420px] overflow-hidden'
              : 'min-h-[400px] px-6 py-16 sm:px-10',
          )}
        >
          <Button
            type="button"
            aria-label="Replay"
            title="Replay"
            hoverScale={1.05}
            onClick={() => setRun((r) => r + 1)}
            className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={14} />
          </Button>
          <div
            key={run}
            className={cn(
              'flex w-full items-center justify-center',
              fullBleed && 'absolute inset-0',
            )}
          >
            {children}
          </div>
        </div>

        <div
          ref={codeRef}
          data-slot="preview-code"
          className="relative overflow-hidden rounded-lg bg-background"
        >
          <div className="absolute top-1.5 right-1.5 z-2">
            <CopyButton getText={() => getPreText(codeRef.current)} />
          </div>
          <motion.div
            initial={false}
            animate={{ height: open ? 'auto' : COLLAPSED_HEIGHT }}
            transition={open ? transition.disclosure : transition.exit}
            className="overflow-hidden [&_[data-slot=codeblock-viewport]]:max-h-[600px]"
            inert={!open}
          >
            <div ref={contentRef}>
              <InCodeTabsContext value>{code}</InCodeTabsContext>
            </div>
          </motion.div>
          <AnimatePresence initial={false}>
            {!open && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-background/20 to-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: transition.fade }}
                exit={{ opacity: 0, transition: transition.exit }}
              >
                <Button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  View code
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ReducedMotionConfig>
  );
}
