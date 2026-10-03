import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

import { demos } from '@/demos';

import { PreviewFrame } from './preview-frame';

/**
 * A primitive's demo: the shadcn/ui component built on it, plus its usage.
 * The code shown is the demo file itself.
 */
export async function ComponentPreview({ name }: { name: string }) {
  const Demo = demos[name];
  if (!Demo) throw new Error(`Unknown demo "${name}" (see demos/index.ts).`);

  const code = await readFile(
    path.join(process.cwd(), 'demos', `${name}.tsx`),
    'utf8',
  );

  return (
    <PreviewFrame
      code={
        <ServerCodeBlock
          code={code.trimEnd()}
          lang="tsx"
          codeblock={{ className: 'my-0 rounded-none border-0' }}
        />
      }
    >
      <Demo />
    </PreviewFrame>
  );
}
