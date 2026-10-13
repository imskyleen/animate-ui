'use client';

import { DynamicCodeBlock as FumadocsDynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { createContext, use, type ComponentProps } from 'react';

import { CodeBlock, Pre, type CodeBlockProps } from './codeblock';

const CodeBlockPropsContext = createContext<
  Omit<CodeBlockProps, 'children'> | undefined
>(undefined);

function DynamicPre(props: ComponentProps<'pre'>) {
  const codeblock = use(CodeBlockPropsContext);
  return (
    <CodeBlock {...props} {...codeblock}>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}

const OPTIONS = {
  themes: { light: 'github-light', dark: 'github-dark' },
  components: { pre: DynamicPre },
} as const;

export function DynamicCodeBlock({
  code,
  lang,
  codeblock,
}: {
  code: string;
  lang: string;
  codeblock?: Omit<CodeBlockProps, 'children'>;
}) {
  return (
    <CodeBlockPropsContext value={codeblock}>
      <FumadocsDynamicCodeBlock code={code} lang={lang} options={OPTIONS} />
    </CodeBlockPropsContext>
  );
}
