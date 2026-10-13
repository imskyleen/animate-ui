import { highlight, type HighlightOptions } from 'fumadocs-core/highlight';
import type { ReactNode } from 'react';

import { CodeBlock, Pre, type CodeBlockProps } from './codeblock';

export async function ServerCodeBlock({
  code,
  lang,
  codeblock,
  diff,
}: {
  code: string;
  lang: string;
  codeblock?: Omit<CodeBlockProps, 'children'>;
  diff?: string;
}): Promise<ReactNode> {
  return highlight(code, {
    lang,
    transformers: diff ? [diffLines(diff)] : undefined,
    defaultColor: false,
    themes: { light: 'github-light', dark: 'github-dark' },
    components: {
      pre: (props) => (
        <CodeBlock {...props} {...codeblock}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      ),
    },
  });
}

type Transformer = NonNullable<HighlightOptions['transformers']>[number];

function diffLines(diff: string): Transformer {
  return {
    name: 'animate-ui:diff-lines',
    pre(node) {
      this.addClassToHast(node, 'has-diff');
    },
    line(node, line) {
      const mark = diff[line - 1];
      if (mark === '-') this.addClassToHast(node, 'diff remove');
      else if (mark === '+') this.addClassToHast(node, 'diff add');
    },
  };
}
