import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { remarkInclude } from 'fumadocs-mdx/config';
import { source } from '@/lib/source';
import type { InferPageType } from 'fumadocs-core/source';
import fs from 'node:fs/promises';

const processor = remark()
  .use(remarkMdx)
  // needed for Fumadocs MDX
  .use(remarkInclude)
  .use(remarkGfm);

export async function getLLMText(page: InferPageType<typeof source>) {
  if (!page.absolutePath) throw new Error(`No file for page ${page.url}`);

  const processed = await processor.process({
    path: page.absolutePath,
    value: await fs.readFile(page.absolutePath),
  });

  // note: it doesn't escape frontmatter, it's up to you.
  return `# ${page.data.title}
URL: ${page.url}

${processed.value}`;
}
