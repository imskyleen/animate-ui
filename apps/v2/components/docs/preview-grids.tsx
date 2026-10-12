import { LucideLogo } from '@/lib/icon-libraries';
import { LIBRARIES, type LibraryId } from '@/lib/libraries';
import { pageBadge } from '@/lib/page-badges';
import {
  primitiveSection,
  type PrimitiveSection,
} from '@/lib/primitive-sections';
import { source } from '@/lib/source';
import { Bell } from '@/registry/icons/bell';
import { CheckCheck } from '@/registry/icons/check-check';
import { Heart } from '@/registry/icons/heart';
import { MessageSquare } from '@/registry/icons/message-square';
import { RefreshCw } from '@/registry/icons/refresh-cw';
import { Send } from '@/registry/icons/send';
import { Settings } from '@/registry/icons/settings';
import { Sparkles } from '@/registry/icons/sparkles';

import {
  IconLibraryCard,
  PreviewCard,
  PreviewGrid,
  PrimitiveCard,
  type PrimitiveCardEntry,
} from './preview-card';

/** The sidebar's sections, in its order. */
const SECTIONS: { id: PrimitiveSection; title: string }[] = [
  { id: 'components', title: 'Components' },
  { id: 'animate-ui', title: 'Animate UI' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'texts', title: 'Texts' },
  { id: 'effects', title: 'Effects' },
];

const LIBRARY_ORDER = LIBRARIES.map((library) => library.id);

/** Every primitive, once (its pages in each library), by section. */
export function PrimitivesGrid() {
  const entries = new Map<string, PrimitiveCardEntry>();
  const pages = source
    .getPages()
    .filter((page) => /^\/docs\/primitives\/[^/]+\/[^/]+$/.test(page.url))
    // The default library's title first (Base UI's).
    .sort(
      (a, b) =>
        LIBRARY_ORDER.indexOf(a.url.split('/')[3] as LibraryId) -
        LIBRARY_ORDER.indexOf(b.url.split('/')[3] as LibraryId),
    );
  for (const page of pages) {
    const [, , , library, slug] = page.url.split('/') as [
      string,
      string,
      string,
      LibraryId,
      string,
    ];
    // Its title and status are its default library's page's (the first).
    const entry = entries.get(slug) ?? {
      slug,
      title: page.data.title,
      badge: pageBadge(page.data),
      urls: {},
    };
    entry.urls[library] = page.url;
    entries.set(slug, entry);
  }
  const all = [...entries.values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <div className="flex flex-col gap-12">
      {SECTIONS.map((section) => {
        const cards = all.filter(
          (entry) =>
            primitiveSection(
              entry.slug,
              Object.keys(entry.urls).every((id) => id === 'animate-ui'),
            ) === section.id,
        );
        if (!cards.length) return null;
        return (
          <section key={section.id} className="flex flex-col gap-4">
            <h2 className="not-prose text-xl font-medium">{section.title}</h2>
            <PreviewGrid>
              {cards.map((entry) => (
                <PrimitiveCard key={entry.slug} entry={entry} />
              ))}
            </PreviewGrid>
          </section>
        );
      })}
    </div>
  );
}

/** Every background. */
export function BackgroundsGrid() {
  const pages = source
    .getPages()
    .filter((page) => /^\/docs\/backgrounds\/[^/]+$/.test(page.url))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
  return (
    <PreviewGrid>
      {pages.map((page) => (
        <PreviewCard
          key={page.url}
          href={page.url}
          title={page.data.title.replace(/ Background$/, '')}
          badge={pageBadge(page.data)}
          preview={`backgrounds/${page.url.split('/').pop()}`}
        />
      ))}
    </PreviewGrid>
  );
}

/** Every icon library, with some of its best icons. */
export function IconLibrariesGrid() {
  return (
    <PreviewGrid>
      <IconLibraryCard
        href="/docs/icons/lucide-icons"
        title="Lucide Icons"
        logo={
          <LucideLogo monochrome className="size-4 text-muted-foreground" />
        }
        icons={[
          Bell,
          Sparkles,
          Settings,
          Heart,
          Send,
          CheckCheck,
          MessageSquare,
          RefreshCw,
        ]}
      />
    </PreviewGrid>
  );
}
