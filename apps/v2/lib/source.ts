import { llms, loader } from 'fumadocs-core/source';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

import { toLlmMarkdown } from './llms-markdown';
import { attachBadge } from './page-badges';

const flag = pageSchema.shape.full;

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      releaseDate: pageSchema.shape.description,
      updatedDate: pageSchema.shape.description,
      version: pageSchema.shape.description,
      new: flag,
      alpha: flag,
      beta: flag,
      updated: flag,
      deprecated: flag,
    }),
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [
    { name: 'animate-ui:badges', transformPageTree: { file: attachBadge } },
  ],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${toLlmMarkdown(await page.data.getText('processed'))}`,
});
