'use client';

import * as React from 'react';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CopyButton,
  CopyButtonIcon,
} from '@animate-ui/react/primitives/buttons/copy';
import {
  CodeBlock as CodeBlockPrimitive,
  type CodeBlockProps as CodeBlockPrimitiveProps,
} from '@animate-ui/react/primitives/code-block';
import { cn } from 'cn';

type CodeBlockProps = CodeBlockPrimitiveProps & {
  cursor?: boolean;
  copyButton?: boolean;
  scrollClassName?: string;
};

function CodeBlock({
  code,
  cursor = true,
  copyButton = true,
  className,
  scrollClassName,
  ...props
}: CodeBlockProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <div data-slot="code-block-frame" className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'max-h-96 overflow-auto rounded-xl bg-accent p-4 text-sm',
          scrollClassName,
        )}
      >
        <CodeBlockPrimitive
          code={code}
          scrollContainerRef={scrollRef}
          className={cn(
            '[&_code]:text-[13px]! [&>pre,_&_code]:border-none [&>pre,_&_code]:bg-transparent!',
            cursor &&
              "data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:content-['|']",
          )}
          {...props}
        />
      </div>
      {copyButton && (
        <CopyButton
          content={code}
          aria-label="Copy code"
          className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
        >
          <CopyButtonIcon
            icon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />}
            copiedIcon={<HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />}
          />
        </CopyButton>
      )}
    </div>
  );
}

export { CodeBlock, type CodeBlockProps };
