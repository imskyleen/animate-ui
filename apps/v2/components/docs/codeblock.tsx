'use client';

import { cn } from 'cn';
import {
  createContext,
  use,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { CopyButton, getPreText } from './copy-button';

/** Inside code tabs, a code block is only its viewport: the tabs own the frame. */
export const InCodeTabsContext = createContext(false);

export type CodeBlockProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title?: ReactNode;
  /** An SVG string (from Fumadocs' rehype-code) or a node. */
  icon?: ReactNode;
  allowCopy?: boolean | 'true' | 'false';
  viewportClassName?: string;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number;
};

export function Pre({ className, ...props }: ComponentProps<'pre'>) {
  return (
    <pre
      {...props}
      className={cn(
        'w-max min-w-full focus-visible:outline-none *:flex *:flex-col',
        className,
      )}
    />
  );
}

/**
 * v1's code block: an accent frame, the code on the background inside, and
 * Animate UI's copy button in the top-right notch (or in the title bar).
 */
export function CodeBlock({
  title,
  icon,
  allowCopy = true,
  viewportClassName,
  className,
  style,
  children,
  ...props
}: CodeBlockProps) {
  const inTabs = use(InCodeTabsContext);
  const areaRef = useRef<HTMLDivElement>(null);
  const copy = allowCopy !== false && allowCopy !== 'false';

  const viewport = (
    <div
      ref={areaRef}
      role="region"
      tabIndex={0}
      data-slot="codeblock-viewport"
      className={cn(
        'fd-scroll-container max-h-[600px] overflow-auto overscroll-x-none py-3.5 text-[13px] leading-relaxed focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset',
        viewportClassName,
      )}
      style={
        {
          // Long lines scroll clear of the copy button's notch.
          ...(!title && copy && !inTabs
            ? { '--padding-right': 'calc(var(--spacing) * 10)' }
            : {}),
          counterSet: props['data-line-numbers']
            ? `line ${Number(props['data-line-numbers-start'] ?? 1) - 1}`
            : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );

  if (inTabs) {
    return (
      <div
        {...props}
        dir="ltr"
        // Shiki's <pre tabindex="0">: the viewport is the focusable part here.
        tabIndex={-1}
        className={cn('shiki not-prose text-sm', className)}
        style={style}
      >
        {viewport}
      </div>
    );
  }

  return (
    <figure
      {...props}
      dir="ltr"
      // Shiki's <pre tabindex="0">: the viewport is the focusable part here.
      tabIndex={-1}
      data-slot="codeblock"
      className={cn(
        'shiki group not-prose relative my-6 overflow-hidden rounded-xl bg-accent text-sm',
        className,
      )}
      style={style}
    >
      {title ? (
        <div className="flex h-10 items-center gap-2 pr-2.5 pl-4 text-muted-foreground">
          {typeof icon === 'string' ? (
            <div
              className="[&_svg]:size-3.5"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          ) : (
            icon && <div className="[&_svg]:size-3.5">{icon}</div>
          )}
          <figcaption className="flex-1 truncate">{title}</figcaption>
          {copy && <CopyButton getText={() => getPreText(areaRef.current)} />}
        </div>
      ) : (
        copy && (
          <div className="absolute top-0 right-0 z-2 rounded-bl-xl bg-accent p-1.5">
            <CopyButton getText={() => getPreText(areaRef.current)} />
          </div>
        )
      )}
      <div className={cn('p-1.5', title && 'pt-0')}>
        <div className="overflow-hidden rounded-md bg-background">
          {viewport}
        </div>
      </div>
    </figure>
  );
}
