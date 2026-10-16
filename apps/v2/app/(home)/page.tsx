import Link from 'next/link';

import { Hero } from '@/components/home/hero';
import { IntroProvider } from '@/components/home/intro';
import { OneCommand } from '@/components/home/one-command';
import { Orbit } from '@/components/home/orbit';

export default function HomePage() {
  return (
    <IntroProvider>
      <Hero />
      <Orbit />
      <OneCommand />

      <footer className="mx-auto mt-24 flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t px-5 py-8 text-sm text-muted-foreground">
        <span>Animate UI is open source under the MIT license.</span>
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
    </IntroProvider>
  );
}
