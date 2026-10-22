import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

import { SearchDialog } from '@/components/layout/search-dialog';
import { Toaster } from '@/components/ui/sonner';
import { changelogSeenScript } from '@/lib/changelog-seen';
import { source } from '@/lib/source';
import { siteIcons } from '@/lib/vue';

import './global.css';

export const metadata: Metadata = {
  title: {
    template: '%s - Animate UI',
    default: 'Animate UI - Animated primitives for React',
  },
  description:
    'Animated drop-in primitives for Radix UI, Base UI and React Aria, built with Motion. Swap the import and your shadcn/ui components animate.',
  metadataBase: new URL('https://animate-ui.com'),
  icons: siteIcons(),
};

const outfit = Outfit({ subsets: ['latin'] });

export default function Layout({ children }: LayoutProps<'/'>) {
  const { version } = (source.getPage(['changelog'])?.data ?? {}) as {
    version?: string;
  };
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      {version && (
        <head>
          <script
            // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: changelogSeenScript(version) }}
          />
        </head>
      )}
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog }}>
          {children}
          <Toaster position="top-center" />
        </RootProvider>
      </body>
    </html>
  );
}
