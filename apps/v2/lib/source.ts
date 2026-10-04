import { llms, loader } from 'fumadocs-core/source';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

import { attachBadge } from './page-badges';

// Optional flags, typed like Fumadocs' own (`full`, `description`).
const flag = pageSchema.shape.full;

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // Sidebar badges, as in v1: `releaseDate: "YYYY-MM-DD"` (new for 30
    // days), `alpha`, `beta`, `updated`, `deprecated`.
    schema: pageSchema.extend({
      releaseDate: pageSchema.shape.description,
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

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [
    { name: 'animate-ui:badges', transformPageTree: { file: attachBadge } },
  ],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
