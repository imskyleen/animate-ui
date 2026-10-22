import { HugeiconsLogo, LucideLogo } from '@/lib/icon-libraries';
import { Delete02 } from '@/registry/hugeicons/delete-02';
import { Favourite } from '@/registry/hugeicons/favourite';
import { Mail01 } from '@/registry/hugeicons/mail-01';
import { Notification01 } from '@/registry/hugeicons/notification-01';
import { Sent } from '@/registry/hugeicons/sent';
import { Settings02 } from '@/registry/hugeicons/settings-02';
import { Sparkles as HugeSparkles } from '@/registry/hugeicons/sparkles';
import { Sun03 } from '@/registry/hugeicons/sun-03';
import { getPrimitive } from '@/lib/docs';
import { LIBRARIES } from '@/lib/libraries';
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

const SECTIONS: { id: PrimitiveSection; title: string }[] = [
  { id: 'components', title: 'Components' },
  { id: 'animate-ui', title: 'Animate UI' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'texts', title: 'Texts' },
  { id: 'numbers', title: 'Numbers' },
  { id: 'effects', title: 'Effects' },
];

const LIBRARY_ORDER = LIBRARIES.map((library) => library.id);

export function PrimitivesGrid({
  framework = 'react',
}: {
  framework?: 'react' | 'vue';
}) {
  const entries = new Map<string, PrimitiveCardEntry>();
  const pages = source
    .getPages()
    .flatMap((page) => {
      const primitive = getPrimitive(page);
      return primitive?.framework === framework ? [{ page, primitive }] : [];
    })
    .sort(
      (a, b) =>
        LIBRARY_ORDER.indexOf(a.primitive.library) -
        LIBRARY_ORDER.indexOf(b.primitive.library),
    );
  for (const { page, primitive } of pages) {
    const entry = entries.get(primitive.name) ?? {
      slug: primitive.name,
      framework,
      title: page.data.title,
      badge: pageBadge(page.data),
      urls: {},
    };
    entry.urls[primitive.library] = page.url;
    entries.set(primitive.name, entry);
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

export function BackgroundsGrid({
  framework = 'react',
}: {
  framework?: 'react' | 'vue';
}) {
  const vue = framework === 'vue';
  const docs = vue ? '/docs/vue/backgrounds/' : '/docs/backgrounds/';
  const pages = source
    .getPages()
    .filter(
      (page) =>
        page.url.startsWith(docs) && !page.url.slice(docs.length).includes('/'),
    )
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
  return (
    <PreviewGrid>
      {pages.map((page) => (
        <PreviewCard
          key={page.url}
          href={page.url}
          title={page.data.title.replace(/ Background$/, '')}
          badge={pageBadge(page.data)}
          preview={`${vue ? 'vue/' : ''}backgrounds/${page.url.split('/').pop()}`}
        />
      ))}
    </PreviewGrid>
  );
}

const VUE_LUCIDE = [
  'bell',
  'sparkles',
  'settings',
  'heart',
  'send',
  'check-check',
  'message-square',
  'refresh-cw',
].map((name) => `icons/lucide/${name}`);

const VUE_HUGEICONS = [
  'notification-01',
  'sparkles',
  'settings-02',
  'favourite',
  'sent',
  'sun-03',
  'mail-01',
  'delete-02',
].map((name) => `icons/hugeicons/${name}`);

export function IconLibrariesGrid({
  framework = 'react',
}: {
  framework?: 'react' | 'vue';
}) {
  const vue = framework === 'vue';
  const docs = vue ? '/docs/vue/icons' : '/docs/icons';
  return (
    <PreviewGrid>
      <IconLibraryCard
        href={`${docs}/lucide-icons`}
        vueIcons={vue ? VUE_LUCIDE : undefined}
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
      <IconLibraryCard
        href={`${docs}/hugeicons`}
        vueIcons={vue ? VUE_HUGEICONS : undefined}
        title="Hugeicons"
        logo={<HugeiconsLogo className="size-4 text-muted-foreground" />}
        icons={[
          Notification01,
          HugeSparkles,
          Settings02,
          Favourite,
          Sent,
          Sun03,
          Mail01,
          Delete02,
        ]}
      />
    </PreviewGrid>
  );
}
