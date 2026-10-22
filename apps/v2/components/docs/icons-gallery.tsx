'use client';

import {
  AnimateIcon,
  staticAnimations,
  type IconProps,
} from '@animate-ui/react/icons';
import {
  Cancel01Icon,
  InfinityIcon,
  RefreshIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { motionTokens } from '@animate-ui/react/utils/motion';
import {
  AnimatePresence,
  motion,
  PresenceContext,
  useInView,
  useReducedMotion,
} from 'motion/react';
import {
  createContext,
  use,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';

import { toProjectPath } from '@/lib/registry-path';
import * as hugeicons from '@/registry/hugeicons';
import * as lucide from '@/registry/icons';
import type { IconEntry } from '@/registry/icons';
import { Check } from '@/registry/icons/check';

import { ClientCommand } from './client-command';
import { DynamicCodeBlock } from './dynamic-codeblock';
import { VueDemo } from './vue-demo';
import { InstallTabs } from './install-tabs';
import { isRecent } from '@/lib/new-badge';

type Loaded = {
  Icon: ComponentType<IconProps<string>>;
  name: string;
  animations: string[];
};

type IconLibrary = {
  icons: IconEntry[];
  categoryTitles: Record<string, string>;
  tags: { id: string; title: string }[];
  iconComponent: typeof lucide.iconComponent;
  prefix: string;
  importPath: string;
  newIcons: Set<string>;
};

function newIcons(icons: IconEntry[]) {
  return new Set(
    icons
      .filter((icon) => icon.added && isRecent(icon.added))
      .map((icon) => icon.name),
  );
}

const TAGS = [
  { id: 'arrows', title: 'Arrows' },
  { id: 'charts', title: 'Charts' },
  { id: 'weather', title: 'Weather' },
  { id: 'time', title: 'Time' },
  { id: 'devices', title: 'Devices' },
  { id: 'connectivity', title: 'Connectivity' },
  { id: 'multimedia', title: 'Multimedia' },
  { id: 'notifications', title: 'Notifications' },
  { id: 'development', title: 'Development' },
];

const ICON_LIBRARIES = {
  lucide: {
    icons: lucide.ICONS,
    categoryTitles: Object.fromEntries(
      lucide.CATEGORIES.map((category) => [category.id, category.title]),
    ),
    tags: TAGS,
    iconComponent: lucide.iconComponent,
    prefix: 'icons-lucide',
    importPath: '@/components/animate-ui/icons',
    newIcons: newIcons(lucide.ICONS),
  },
  hugeicons: {
    icons: hugeicons.ICONS,
    categoryTitles: Object.fromEntries(
      hugeicons.CATEGORIES.map((category) => [category.id, category.title]),
    ),
    tags: TAGS,
    iconComponent: hugeicons.iconComponent,
    prefix: 'icons-hugeicons',
    importPath: '@/components/animate-ui/icons/hugeicons',
    newIcons: newIcons(hugeicons.ICONS),
  },
} satisfies Record<string, IconLibrary>;

type IconLibraryId = keyof typeof ICON_LIBRARIES;

const LibraryContext = createContext<IconLibrary>(ICON_LIBRARIES.lucide);

type Framework = 'react' | 'vue';

const FrameworkContext = createContext<Framework>('react');

const vueName = (library: IconLibrary, entry: IconEntry) =>
  `icons/${library.prefix.replace('icons-', '')}/${entry.name}`;

const cache = new Map<string, Promise<Loaded>>();

function loadIcon(library: IconLibrary, entry: IconEntry) {
  const key = `${library.prefix}-${entry.name}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = entry.load().then((mod) => ({
      Icon: library.iconComponent(mod, entry.name)!,
      name:
        Object.keys(mod).find(
          (key) =>
            key.toLowerCase() === entry.name.replace(/-/g, '').toLowerCase(),
        ) ?? entry.title.replace(/\s+/g, ''),
      animations: [
        ...Object.keys(mod.animations),
        ...Object.keys(staticAnimations),
      ],
    }));
    cache.set(key, promise);
  }
  return promise;
}

function useIcon(entry: IconEntry, enabled = true) {
  const library = use(LibraryContext);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadIcon(library, entry).then((icon) => active && setLoaded(icon));
    return () => {
      active = false;
    };
  }, [library, entry, enabled]);
  return loaded;
}

function IconTile({
  entry,
  selected,
  onSelect,
}: {
  entry: IconEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const library = use(LibraryContext);
  const vue = use(FrameworkContext) === 'vue';
  const isNew = library.newIcons.has(entry.name);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: '200px' });
  const icon = useIcon(entry, inView);

  return (
    <AnimateIcon animateOnHover={!vue} asChild>
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        onPointerEnter={(event) => {
          if (vue && event.pointerType !== 'touch') setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        aria-pressed={selected}
        title={entry.title}
        className={cn(
          'relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-accent p-2 text-muted-foreground transition-colors hover:text-foreground',
          selected && 'text-foreground ring-2 ring-primary ring-inset',
        )}
      >
        <span className="flex size-8 items-center justify-center">
          {icon &&
            (vue ? (
              <VueDemo
                name={vueName(library, entry)}
                size={28}
                animate={hovered}
              />
            ) : (
              <icon.Icon size={28} />
            ))}
        </span>
        <span className="w-full truncate text-center text-xs">
          {entry.title}
        </span>
        {isNew && (
          <span
            data-slot="new"
            aria-label="New"
            className="absolute top-2.5 left-2.5 size-2 rounded-full bg-foreground"
          />
        )}
        {icon && (
          <span
            data-slot="animation-count"
            aria-hidden
            title={`${icon.animations.length} animations`}
            className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-background px-1 text-[10px] leading-none font-medium text-muted-foreground tabular-nums"
          >
            {icon.animations.length}
          </span>
        )}
      </button>
    </AnimateIcon>
  );
}

const items = new Map<string, Promise<{ content: string; target: string }>>();

function loadItem(name: string) {
  let item = items.get(name);
  if (!item) {
    item = fetch(`/r/${name}.json`)
      .then((response) => response.json())
      .then(
        (json: {
          files: { content: string; target?: string; path: string }[];
        }) => {
          const file = json.files[0]!;
          return { content: file.content, target: file.target ?? file.path };
        },
      );
    items.set(name, item);
  }
  return item;
}

function IconInstallation({ entry }: { entry: IconEntry }) {
  const vue = use(FrameworkContext) === 'vue';
  const item = `${use(LibraryContext).prefix}-${entry.name}`;
  const url = `https://animate-ui.com/r/vue/${item}.json`;
  const [file, setFile] = useState<{ content: string; target: string } | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    void loadItem(vue ? `vue/${item}` : item).then(
      (loaded) => active && setFile(loaded),
    );
    return () => {
      active = false;
    };
  }, [item, vue]);

  return (
    <InstallTabs
      groupId="icon-installation"
      className="my-0"
      tabs={[
        {
          value: 'cli',
          label: 'CLI',
          content: (
            <ClientCommand
              className="my-0"
              command={(m) =>
                vue
                  ? `${m.dlx} shadcn-vue@latest add ${url}`
                  : `${m.dlx} shadcn@latest add @animate-ui/${item}`
              }
            />
          ),
        },
        {
          value: 'manual',
          label: 'Manual',
          content: (
            <div className="flex flex-col gap-3">
              <ClientCommand
                className="my-0"
                command={(m) =>
                  vue
                    ? `${m.add} @animate-ui/vue motion-v`
                    : `${m.add} @animate-ui/react motion`
                }
              />
              {file && (
                <DynamicCodeBlock
                  lang={vue ? 'vue' : 'tsx'}
                  codeblock={{
                    className: 'my-0',
                    title: vue ? file.target : toProjectPath(file.target),
                    viewportClassName: 'max-h-44',
                  }}
                  code={file.content.trimEnd()}
                />
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

function IconDetail({
  entry,
  onClose,
  loop,
  onLoopChange,
}: {
  entry: IconEntry;
  onClose: () => void;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
}) {
  const library = use(LibraryContext);
  const vue = use(FrameworkContext) === 'vue';
  const icon = useIcon(entry);
  const [animation, setAnimation] = useState('default');
  const [run, setRun] = useState(0);
  const component = icon?.name ?? entry.title.replace(/\s+/g, '');

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:gap-6">
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-accent/50 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[7.5px_7.5px] max-sm:hidden">
        {icon &&
          (vue ? (
            <VueDemo
              key={`${animation}-${run}-${loop}`}
              name={vueName(library, entry)}
              size={120}
              animation={animation}
              animate
              loop={loop}
            />
          ) : (
            <icon.Icon
              key={`${animation}-${run}-${loop}`}
              size={120}
              animation={animation}
              animate
              loop={loop}
            />
          ))}
        <button
          type="button"
          aria-label="Loop"
          aria-pressed={loop}
          onClick={() => onLoopChange(!loop)}
          className={cn(
            'absolute top-2 left-2 flex size-7 items-center justify-center rounded-md transition-colors',
            loop
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/80 text-muted-foreground hover:text-foreground',
          )}
        >
          <HugeiconsIcon icon={InfinityIcon} strokeWidth={2} size={14} />
        </button>
        <button
          type="button"
          aria-label="Replay"
          onClick={() => setRun((r) => r + 1)}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={14} />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xl font-medium">{entry.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {entry.keywords.slice(0, 6).join(' • ')}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} size={16} />
          </button>
        </div>

        {entry.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {entry.categories.map((id) => (
              <span
                key={id}
                data-slot="category"
                className="rounded-md bg-accent px-2 py-1 text-xs"
              >
                {library.categoryTitles[id]}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {icon?.animations.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setAnimation(name);
                setRun((r) => r + 1);
              }}
              className={cn(
                'h-7 rounded-full px-3 text-xs transition-colors',
                name === animation
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <IconInstallation entry={entry} />
        <DynamicCodeBlock
          lang={vue ? 'vue' : 'tsx'}
          codeblock={{ className: 'my-0' }}
          code={
            vue
              ? `<script setup lang="ts">\nimport ${component} from '${library.importPath}/${component}.vue';\n</script>\n\n<template>\n  <${component} animate-on-hover${animation === 'default' ? '' : ` animation="${animation}"`} />\n</template>`
              : `import { ${component} } from '${library.importPath}/${entry.name}';\n\n<${component} animateOnHover${animation === 'default' ? '' : ` animation="${animation}"`} />`
          }
        />
      </div>
    </div>
  );
}

function IconDrawer({
  entry,
  onClose,
}: {
  entry: IconEntry | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [loop, setLoop] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);
  const open = entry !== null;
  const [detached, setDetached] = useState(false);
  const [fade, setFade] = useState(false);

  const isDetached = () => {
    const holder = holderRef.current;
    return (
      !!holder && holder.getBoundingClientRect().bottom < window.innerHeight - 1
    );
  };

  const leavingRef = useRef(false);
  const wasOpenRef = useRef(false);
  useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open) {
      if (wasOpen) leavingRef.current = true;
      return;
    }
    const off = isDetached();
    setDetached(off);
    setFade(off && !leavingRef.current);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setDetached(isDetached());
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(check);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const holder = holderRef.current;
    if (holder) {
      observer.observe(holder);
      if (holder.parentElement) observer.observe(holder.parentElement);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [open]);

  useEffect(() => {
    if (!entry) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entry, onClose]);

  return (
    <div
      ref={holderRef}
      className="pointer-events-none sticky bottom-0 z-20 -mx-4 -mt-8 overflow-hidden px-4 pt-8"
    >
      <AnimatePresence
        initial={false}
        onExitComplete={() => (leavingRef.current = false)}
      >
        {entry && (
          <motion.div
            key="drawer"
            role="dialog"
            aria-label={entry.title}
            data-slot="icon-drawer"
            data-detached={detached ? '' : undefined}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={
              reduce
                ? { opacity: 1 }
                : fade
                  ? { y: [0, 0], opacity: [0, 1], scale: [0.98, 1] }
                  : { y: 0, opacity: 1, scale: 1 }
            }
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.15 } }
                : detached
                  ? {
                      opacity: 0,
                      scale: 0.98,
                      transition: motionTokens.transition.drawerOut,
                    }
                  : { y: '100%', transition: motionTokens.transition.drawerOut }
            }
            transition={
              fade
                ? { duration: 0.2, ease: motionTokens.ease.out }
                : motionTokens.transition.drawer
            }
            style={{ transformOrigin: 'bottom' }}
            className="pointer-events-auto relative mt-4 rounded-2xl rounded-b-none border border-b-transparent bg-background shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.25)] transition-[border-radius,border-color] duration-200 ease-out data-detached:rounded-b-2xl data-detached:border-b-border"
          >
            <div className="max-h-[70vh] overflow-y-auto">
              <PresenceContext value={null}>
                <IconDetail
                  key={entry.name}
                  entry={entry}
                  onClose={onClose}
                  loop={loop}
                  onLoopChange={setLoop}
                />
              </PresenceContext>
            </div>
            <div
              aria-hidden
              className="absolute inset-x-[-1px] top-[calc(100%+1px)] h-6 border-x bg-background"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      aria-pressed={active}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={cn(
        'flex h-7 items-center gap-1 overflow-hidden rounded-full px-3 text-xs transition-colors duration-200',
        active
          ? 'bg-primary pl-2 text-primary-foreground'
          : 'bg-accent text-muted-foreground hover:text-foreground',
      )}
    >
      {active && <Check animate size={14} className="shrink-0" />}
      <motion.span layout="position">{children}</motion.span>
    </motion.button>
  );
}

export function IconsGallery({
  library: id = 'lucide',
  framework = 'react',
}: {
  library?: IconLibraryId;
  framework?: Framework;
}) {
  const library: IconLibrary = ICON_LIBRARIES[id];
  const { icons: allIcons, newIcons: newOnes, tags } = library;
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const closeDrawer = useCallback(() => {
    const root = galleryRef.current;
    const drawer = root?.querySelector('[data-slot=icon-drawer]');
    if (selected && drawer?.contains(document.activeElement))
      root
        ?.querySelector<HTMLElement>(
          `button[aria-pressed][title="${CSS.escape(selected.title)}"]`,
        )
        ?.focus();
    setSelected(null);
  }, [selected]);
  const [filter, setFilter] = useState('all');

  const icons = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return allIcons.filter(
      (icon) =>
        (filter === 'all' ||
          (filter === 'new'
            ? newOnes.has(icon.name)
            : icon.categories.includes(filter))) &&
        (!q ||
          icon.name.includes(q) ||
          icon.title.toLowerCase().includes(q) ||
          icon.keywords.some((keyword) => keyword.includes(q))),
    );
  }, [allIcons, newOnes, deferred, filter]);

  useEffect(() => {
    if (!deferred.trim() && filter === 'all') return;
    for (const entry of icons.slice(0, 60)) void loadIcon(library, entry);
  }, [icons, library, deferred, filter]);

  return (
    <LibraryContext value={library}>
      <FrameworkContext value={framework}>
        <div ref={galleryRef} className="not-prose my-6 text-foreground">
          <label className="mb-4 flex h-10 items-center gap-2 rounded-lg bg-accent px-3 text-sm focus-within:ring-2 focus-within:ring-ring/50">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              size={16}
              className="text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${allIcons.length} icons…`}
              className="h-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {icons.length}
            </span>
          </label>

          {(tags.length > 0 || newOnes.size > 0) && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              <FilterChip
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                All
              </FilterChip>
              {newOnes.size > 0 && newOnes.size < allIcons.length && (
                <FilterChip
                  active={filter === 'new'}
                  onClick={() => setFilter('new')}
                >
                  New
                </FilterChip>
              )}
              {tags.map((category) => (
                <FilterChip
                  key={category.id}
                  active={filter === category.id}
                  onClick={() => setFilter(category.id)}
                >
                  {category.title}
                </FilterChip>
              ))}
            </div>
          )}

          {icons.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {query ? <>No icon matches “{query}”.</> : 'No icon here yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
              {icons.map((icon) => (
                <IconTile
                  key={icon.name}
                  entry={icon}
                  selected={selected?.name === icon.name}
                  onSelect={() => setSelected(icon)}
                />
              ))}
            </div>
          )}

          <IconDrawer entry={selected} onClose={closeDrawer} />
        </div>
      </FrameworkContext>
    </LibraryContext>
  );
}
