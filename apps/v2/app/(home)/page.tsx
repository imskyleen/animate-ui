import Link from 'next/link';
import type { ComponentType } from 'react';

import { Hero } from '@/components/home/hero';
import BaseUIDropdownMenu from '@/demos/base-ui/dropdown-menu';
import RadixUIDialog from '@/demos/radix-ui/dialog';
import RadixUISwitch from '@/demos/radix-ui/switch';
import ReactAriaTabs from '@/demos/react-aria/tabs';
import { getLibrary, type LibraryId } from '@/lib/libraries';

const SHOWCASE: {
  library: LibraryId;
  name: string;
  title: string;
  Demo: ComponentType;
}[] = [
  { library: 'radix-ui', name: 'dialog', title: 'Dialog', Demo: RadixUIDialog },
  {
    library: 'base-ui',
    name: 'dropdown-menu',
    title: 'Dropdown Menu',
    Demo: BaseUIDropdownMenu,
  },
  { library: 'react-aria', name: 'tabs', title: 'Tabs', Demo: ReactAriaTabs },
  { library: 'radix-ui', name: 'switch', title: 'Switch', Demo: RadixUISwitch },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto mt-24 grid w-full max-w-[1200px] gap-4 px-5 md:grid-cols-2">
        {SHOWCASE.map(({ library, name, title, Demo }) => {
          const { Logo, title: libraryTitle } = getLibrary(library)!;
          return (
            <div
              key={`${library}/${name}`}
              className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border-2 border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-1 items-center justify-center p-8">
                <Demo />
              </div>
              <Link
                href={`/docs/primitives/${library}/${name}`}
                className="flex items-center justify-between border-t-2 border-neutral-200 px-4 py-3 text-sm transition-colors hover:bg-accent/50 dark:border-neutral-800"
              >
                <span className="font-medium">{title}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Logo className="size-3.5" />
                  {libraryTitle}
                </span>
              </Link>
            </div>
          );
        })}
      </section>

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
    </>
  );
}
