import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LibraryTabs } from '@/components/docs/library-tabs';
import { CopyPage, PageNavigation } from '@/components/docs/page-actions';
import { getMDXComponents } from '@/components/mdx';
import { getNeighbours, getPrimitive, getPrimitiveUrls } from '@/lib/docs';
import { getPageImageUrl, getPageMarkdownUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const primitive = getPrimitive(page);
  const { previous, next } = getNeighbours(page);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <div className="flex items-start justify-between gap-4">
        <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
        <div className="flex shrink-0 items-center gap-2">
          <CopyPage markdownUrl={getPageMarkdownUrl(page).url} />
          <PageNavigation previous={previous} next={next} />
        </div>
      </div>
      <DocsDescription className="mb-2">
        {page.data.description}
      </DocsDescription>
      {primitive && (
        <LibraryTabs
          current={primitive.library}
          urls={getPrimitiveUrls(primitive.name)}
        />
      )}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: { images: getPageImageUrl(page).url },
  };
}
