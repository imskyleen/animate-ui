import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
  EditOnGitHub,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/mdx-components';
import { Metadata } from 'next';
import { DocsAuthor } from '@/components/docs/docs-author';
import { ViewOptions, LLMCopyButton } from '@/components/docs/page-actions';
import { Footer } from '@workspace/ui/components/docs/footer';
import { Button } from '@/registry/components/buttons/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { findNeighbour } from 'fumadocs-core/server';
import { baseOptions } from '@/app/layout.config';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  const tree = source.getPageTree();
  const { previous, next: nextPage } = findNeighbour(tree, page.url);

  type GuideLink = { text: string; url: string };
  const isGuideLink = (l: unknown): l is GuideLink => {
    if (typeof l !== 'object' || l === null) return false;
    const obj = l as Record<string, unknown>;
    return typeof obj.url === 'string' && typeof obj.text === 'string';
  };
  const guideItems = (baseOptions.links ?? []).filter(isGuideLink);
  const guideIndex = guideItems.findIndex((it) => it.url === page.url);

  const prevNav = (() => {
    if (guideIndex >= 0 && guideItems.length > 0) {
      if (guideIndex > 0) {
        return {
          url: guideItems[guideIndex - 1].url,
          name: guideItems[guideIndex - 1].text,
        } as const;
      }
      return undefined;
    }

    if (previous) {
      return {
        url: previous.url,
        name: String(previous.name ?? 'Précédent'),
      } as const;
    }

    if (page.url.startsWith('/docs/components/')) {
      return { url: '/docs/components', name: 'Components' } as const;
    }
    if (page.url.startsWith('/docs/primitives/')) {
      return { url: '/docs/primitives', name: 'Primitives' } as const;
    }

    const isSectionRoot =
      page.url === '/docs/components' ||
      page.url === '/docs/primitives' ||
      page.url === '/docs/icons/get-started';
    if (isSectionRoot && guideItems.length > 0) {
      const last = guideItems[guideItems.length - 1];
      return { url: last.url, name: last.text } as const;
    }

    return undefined;
  })();

  const nextNav =
    guideIndex >= 0 && guideItems.length > 0
      ? guideIndex < guideItems.length - 1
        ? {
            url: guideItems[guideIndex + 1].url,
            name: guideItems[guideIndex + 1].text,
          }
        : { url: '/docs/components', name: 'Components' }
      : nextPage
        ? { url: nextPage.url, name: String(nextPage.name ?? 'Suivant') }
        : undefined;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      footer={{
        component: (
          <Footer
            lastUpdate={
              page.data.lastModified
                ? new Date(page.data.lastModified)
                : undefined
            }
          />
        ),
      }}
    >
      <div className="flex flex-row gap-2 items-start w-full justify-between">
        <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
        {(prevNav || nextNav) && (
          <div className="flex flex-row gap-1.5 items-center pt-0.5">
            <Link
              href={prevNav?.url ?? page.url}
              aria-disabled={!prevNav}
              className={
                !prevNav ? 'pointer-events-none opacity-50' : undefined
              }
              aria-label={
                prevNav ? `Aller à ${prevNav.name}` : 'Pas de page précédente'
              }
            >
              <Button variant="accent" size="icon-sm">
                <ArrowLeft />
              </Button>
            </Link>
            <Link
              href={nextNav?.url ?? page.url}
              aria-disabled={!nextNav}
              className={
                !nextNav ? 'pointer-events-none opacity-50' : undefined
              }
              aria-label={
                nextNav ? `Aller à ${nextNav.name}` : 'Pas de page suivante'
              }
            >
              <Button variant="accent" size="icon-sm">
                <ArrowRight />
              </Button>
            </Link>
          </div>
        )}
      </div>
      <DocsDescription className="mb-1 font-normal">
        {page.data.description}
      </DocsDescription>
      {page.data.author && (
        <DocsAuthor name={page.data.author.name} url={page.data.author?.url} />
      )}

      <div className="flex flex-row gap-2 items-center">
        <EditOnGitHub
          className="border-0 [&_svg]:text-fd-muted-foreground"
          href={`https://github.com/imskyleen/animate-ui/blob/main/apps/www/content/docs/${params.slug ? `${params.slug.join('/')}.mdx` : 'index.mdx'}`}
        />
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/imskyleen/animate-ui/blob/main/apps/www/content/docs/${page.path}`}
        />
      </div>

      <DocsBody id="docs-body" className="pb-10 pt-4">
        <MDXContent
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

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const image = ['/docs-og', ...slug, 'image.png'].join('/');

  return {
    title: page.data.title,
    description: page.data.description,
    authors: page.data?.author
      ? [
          {
            name: page.data.author.name,
            ...(page.data.author?.url && { url: page.data.author.url }),
          },
        ]
      : {
          name: 'imskyleen',
          url: 'https://github.com/imskyleen',
        },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: 'https://animate-ui.com',
      siteName: 'Animate UI',
      images: image,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@animate_ui',
      title: page.data.title,
      description: page.data.description,
      images: image,
    },
  };
}
