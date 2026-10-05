import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      releaseDate: z.coerce.date().optional(),
      beta: z.boolean().optional(),
      alpha: z.boolean().optional(),
      updated: z.boolean().optional(),
      deprecated: z.boolean().optional(),
      author: z
        .object({
          name: z.string(),
          url: z.string().optional(),
        })
        .optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  lastModifiedTime: 'git',
  mdxOptions: {},
});
