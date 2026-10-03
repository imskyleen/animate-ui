import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

import { PreviewFrame } from './preview-frame';

/**
 * A primitive's demo: the shadcn/ui component built on it, plus its usage.
 * The code shown is the demo file itself.
 */
export async function ComponentPreview({ name }: { name: string }) {
  // demos/<library>/<name>.tsx: discovered by path, no registry to update.
  const { default: Demo } = await import(`@/demos/${name}`);

  // Helpers built on Base UI or React Aria live in components/ui/<library>/
  // here; in the reader's project they are plain @/components/ui/<name>.
  const code = (
    await readFile(path.join(process.cwd(), 'demos', `${name}.tsx`), 'utf8')
  ).replace(/@\/components\/ui\/(?:base-ui|react-aria)\//g, '@/components/ui/');

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
