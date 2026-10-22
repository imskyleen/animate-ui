import type { Metadata } from 'next';

import { AISection } from '@/components/home/ai-section';
import { HomeFooter } from '@/components/home/home-footer';
import { Orbit } from '@/components/home/orbit';
import { appName } from '@/lib/shared';
import { siteIcons } from '@/lib/vue';

const title = 'Animate UI - Animated primitives for Vue';
const description =
  'Animated drop-in primitives for Reka UI, built with Motion for Vue. Swap the import and your shadcn-vue components animate.';
const image = {
  url: '/og-image.png?v=2',
  width: 2400,
  height: 1260,
  alt: 'Animate UI, animate-ui.com, over a grid of animated components',
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/vue' },
  icons: siteIcons(true),
  openGraph: {
    type: 'website',
    url: '/vue',
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

export default function VueHomePage() {
  return (
    <>
      <Orbit />
      <AISection />
      <HomeFooter docs="/docs/vue" />
    </>
  );
}
