import type { Metadata } from 'next';
import Link from 'next/link';

import { Hero } from '@/components/home/hero';
import { AISection } from '@/components/home/ai-section';
import { Orbit } from '@/components/home/orbit';
import { FooterCredit } from '@/components/layout/footer';
import { appName, gitConfig, siteUrl } from '@/lib/shared';

const title = 'Animate UI - Animated primitives for React';
const description =
  'Animated drop-in primitives for Radix UI, Base UI and React Aria, built with Motion. Swap the import and your shadcn/ui components animate.';
const image = {
  url: '/og-image.png',
  width: 9268,
  height: 4635,
  alt: 'Animate UI',
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: appName,
    title,
    description,
    images: [image],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@animate_ui',
    title,
    description,
    images: [image],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: appName,
  description,
  url: siteUrl,
  codeRepository: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  programmingLanguage: ['TypeScript', 'React'],
  license: `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/LICENSE.md`,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Hero />
      <Orbit />
      <AISection />

      <footer className="mx-auto mt-24 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground">
        <FooterCredit className="min-w-0" />
        <span className="flex gap-4">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <a
            href="https://github.com/imskyleen/animate-ui"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a href="https://v1.animate-ui.com" className="hover:text-foreground">
            v1
          </a>
        </span>
      </footer>
    </>
  );
}
