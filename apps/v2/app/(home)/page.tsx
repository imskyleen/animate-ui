import type { Metadata } from 'next';
import { AISection } from '@/components/home/ai-section';
import { Orbit } from '@/components/home/orbit';
import { HomeFooter } from '@/components/home/home-footer';
import { appName, gitConfig, siteUrl } from '@/lib/shared';

const title = 'Animate UI - Animated primitives for React';
const description =
  'Animated drop-in primitives for Radix UI, Base UI and React Aria, built with Motion. Swap the import and your shadcn/ui components animate.';
const image = {
  url: '/og-image.png?v=2',
  width: 2400,
  height: 1260,
  alt: 'Animate UI, animate-ui.com, over a grid of animated components',
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
      <Orbit />
      <AISection />

      <HomeFooter />
    </>
  );
}
