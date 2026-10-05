'use client';

import { CodeBlock, Pre } from '@/components/docs/codeblock';
import type {
  HighlightOptionsCommon,
  HighlightOptionsThemes,
} from 'fumadocs-core/highlight';
import { useShiki } from 'fumadocs-core/highlight/client';
import { cn } from '@workspace/ui/lib/utils';

const getComponents = ({
  title,
  icon,
  onCopy,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  className?: string;
}) =>
  ({
    pre(props) {
      return (
        <CodeBlock
          {...props}
          title={title}
          icon={icon}
          onCopy={onCopy}
          className={cn('my-0', props.className, className)}
        >
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    },
  }) satisfies HighlightOptionsCommon['components'];

export type DynamicCodeBlockProps = {
  lang: string;
  code: string;
  title?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  options?: Omit<HighlightOptionsCommon, 'lang'> & HighlightOptionsThemes;
  className?: string;
};

export function DynamicCodeBlock({
  lang,
  code,
  options,
  title,
  icon,
  onCopy,
  className,
}: DynamicCodeBlockProps) {
  const components = getComponents({ title, icon, onCopy, className });

  return useShiki(code, {
    lang,
    ...options,
    components: {
      ...components,
      ...options?.components,
    },
    withPrerenderScript: true,
  });
}
