import { highlight } from 'fumadocs-core/highlight';
import type { ReactNode } from 'react';

import { CodeBlock, Pre, type CodeBlockProps } from './codeblock';

/**
 * Highlighted on the server by Fumadocs (Shiki), shown in Animate UI's code
 * block.
 */
export async function ServerCodeBlock({
  code,
  lang,
  codeblock,
}: {
  code: string;
  lang: string;
  codeblock?: Omit<CodeBlockProps, 'children'>;
}): Promise<ReactNode> {
  return highlight(code, {
    lang,
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
