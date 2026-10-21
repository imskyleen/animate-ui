import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  TOCPopover,
  TOCProvider,
} from 'fumadocs-ui/layouts/docs/page/slots/toc';

import { Footer } from '@/components/layout/footer';
import { TOC } from '@/components/layout/toc';
import { Installation } from '@/components/docs/installation';
import { LIBRARIES, type LibraryId } from '@/lib/libraries';
import { LibraryTabs } from '@/components/docs/library-tabs';
import { CopyPage, PageNavigation } from '@/components/docs/page-actions';
import { getMDXComponents } from '@/components/mdx';
import { getNeighbours, getPrimitive, getPrimitiveUrls } from '@/lib/docs';
import {
  appName,
  getPageImageUrl,
  getPageMarkdownUrl,
  gitConfig,
  siteUrl,
} from '@/lib/shared';
import { source } from '@/lib/source';
import { siteIcons } from '@/lib/vue';

const INSTALLATIONS = Object.fromEntries(
  LIBRARIES.map(({ id }) => [
    id,
    function LibraryInstallation(
      props: React.ComponentProps<typeof Installation>,
    ) {
      return <Installation {...props} library={id} />;
    },
  ]),
) as Record<LibraryId, typeof Installation>;

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const primitive = getPrimitive(page);
  const { previous, next } = getNeighbours(page);

  const contentPath = path.join('apps/v2/content/docs', page.path);
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${contentPath}`;
  const demo = (
    await readFile(path.join(process.cwd(), 'content/docs', page.path), 'utf8')
  ).match(/<ComponentPreview name="([^"]+)"/)?.[1];
  const demoItem = demo && `demo-${demo.replace('/', '-')}`;
  const v0Url =
    demoItem &&
    existsSync(path.join(process.cwd(), 'public/r', `${demoItem}.json`))
      ? `${siteUrl}/r/${demoItem}.json`
      : undefined;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      slots={{
        toc: { provider: TOCProvider, main: TOC, popover: TOCPopover },
      }}
      className="md:pt-6 xl:pt-6"
    >
      <div className="flex items-start justify-between gap-4">
        <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
        <div className="flex shrink-0 items-center gap-2">
          <CopyPage
            markdownUrl={getPageMarkdownUrl(page).url}
            githubUrl={githubUrl}
            v0Url={v0Url}
          />
          <PageNavigation previous={previous} next={next} />
        </div>
      </div>
      <DocsDescription className="-mt-2 mb-2">
        {page.data.description}
      </DocsDescription>
      {primitive && (
        <LibraryTabs
          current={primitive.library}
          urls={getPrimitiveUrls(primitive.name, primitive.framework)}
          remember={primitive.framework === 'react'}
        />
      )}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
            ...(primitive && {
              Installation: INSTALLATIONS[primitive.library],
            }),
          })}
        />
      </DocsBody>
      <Footer lastUpdate={page.data.lastModified} />
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
    alternates: { canonical: page.url },
    openGraph: {
      type: 'article',
      url: page.url,
      siteName: appName,
      images: `${getPageImageUrl(page).url}?v=2`,
    },
    twitter: { card: 'summary_large_image' },
    ...(page.slugs[0] === 'vue' ? { icons: siteIcons(true) } : null),
  };
}
