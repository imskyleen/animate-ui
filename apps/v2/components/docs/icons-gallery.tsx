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

import * as hugeicons from '@/registry/hugeicons';
import * as lucide from '@/registry/icons';
import type { IconEntry } from '@/registry/icons';
import { Check } from '@/registry/icons/check';

import { ClientCommand } from './client-command';
import { DynamicCodeBlock } from './dynamic-codeblock';
import { InstallTabs } from './install-tabs';

type Loaded = {
  Icon: ComponentType<IconProps<string>>;
  animations: string[];
};

/** An icon library's gallery: its icons, tags, registry items and files. */
type IconLibrary = {
  icons: IconEntry[];
  /** Category titles, by id. */
  categoryTitles: Record<string, string>;
  /**
   * The categories offered as tags: the ones easiest to browse, not every
   * category.
   */
  tags: { id: string; title: string }[];
  iconComponent: typeof lucide.iconComponent;
  /** Its registry items' prefix (`@animate-ui/<prefix>-<name>`). */
  prefix: string;
  /** Where the CLI adds its icons. */
  importPath: string;
  /** Icons added in the last 30 days (v1's New filter). */
  newIcons: Set<string>;
};

/** Icons added in the last 30 days (v1's New filter). */
function newIcons(icons: IconEntry[]) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  return new Set(
    icons
      .filter((icon) => icon.added && new Date(icon.added) >= since)
      .map((icon) => icon.name),
  );
}

const ICON_LIBRARIES = {
  lucide: {
    icons: lucide.ICONS,
    categoryTitles: Object.fromEntries(
      lucide.CATEGORIES.map((category) => [category.id, category.title]),
    ),
    // Not every Lucide category (38 tags filled five rows).
    tags: [
      { id: 'arrows', title: 'Arrows' },
      { id: 'charts', title: 'Charts' },
      { id: 'weather', title: 'Weather' },
      { id: 'time', title: 'Time' },
      { id: 'devices', title: 'Devices' },
      { id: 'connectivity', title: 'Connectivity' },
      { id: 'multimedia', title: 'Multimedia' },
      { id: 'notifications', title: 'Notifications' },
      { id: 'development', title: 'Development' },
    ],
    iconComponent: lucide.iconComponent,
    prefix: 'icons',
    importPath: '@/components/animate-ui/icons',
    newIcons: newIcons(lucide.ICONS),
  },
  hugeicons: {
    icons: hugeicons.ICONS,
    categoryTitles: {},
    tags: [],
    iconComponent: hugeicons.iconComponent,
    prefix: 'hugeicons',
    importPath: '@/components/animate-ui/icons/hugeicons',
    newIcons: newIcons(hugeicons.ICONS),
  },
} satisfies Record<string, IconLibrary>;

type IconLibraryId = keyof typeof ICON_LIBRARIES;

const LibraryContext = createContext<IconLibrary>(ICON_LIBRARIES.lucide);

// By library: Lucide and Hugeicons share names (star, user, sparkles).
const cache = new Map<string, Promise<Loaded>>();

function loadIcon(library: IconLibrary, entry: IconEntry) {
  const key = `${library.prefix}-${entry.name}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = entry.load().then((mod) => ({
      Icon: library.iconComponent(mod, entry.name)!,
      animations: [
        ...Object.keys(mod.animations),
        ...Object.keys(staticAnimations),
      ],
    }));
    cache.set(key, promise);
  }
  return promise;
}

/** Loads the icon module once it scrolls into view. */
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
  const isNew = use(LibraryContext).newIcons.has(entry.name);
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: '200px' });
  const icon = useIcon(entry, inView);

  return (
    <AnimateIcon animateOnHover asChild>
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        title={entry.title}
        className={cn(
          'relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-accent p-2 text-muted-foreground transition-colors hover:text-foreground',
          selected && 'text-foreground ring-2 ring-primary ring-inset',
        )}
      >
        <span className="flex size-8 items-center justify-center">
          {icon && <icon.Icon size={28} />}
        </span>
        <span className="w-full truncate text-center text-xs">
          {entry.title}
        </span>
        {isNew && (
          <span
            data-slot="new"
            aria-label="New"
            className="absolute top-2 left-2 size-1.5 rounded-full bg-foreground"
          />
        )}
        {icon && (
          <span
            data-slot="animation-count"
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

/** An icon's registry item, fetched once (its source, for Manual). */
const items = new Map<string, Promise<{ content: string; target: string }>>();

function loadItem(name: string) {
  let item = items.get(name);
  if (!item) {
    item = fetch(`/r/${name}.json`)
      .then((response) => response.json())
      .then(
        (json: { files: { content: string; target: string }[] }) =>
          json.files[0]!,
      );
    items.set(name, item);
  }
  return item;
}

/**
 * Installing the icon, as on every docs page: the CLI adds the file, Manual
 * installs the dependencies and shows the file to copy. The choice is
 * remembered.
 */
function IconInstallation({ entry }: { entry: IconEntry }) {
  const item = `${use(LibraryContext).prefix}-${entry.name}`;
  const [file, setFile] = useState<{ content: string; target: string } | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    void loadItem(item).then((loaded) => active && setFile(loaded));
    return () => {
      active = false;
    };
  }, [item]);

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
              command={(m) => `${m.dlx} shadcn@latest add @animate-ui/${item}`}
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
                command={(m) => `${m.add} @animate-ui/react motion`}
              />
              {file && (
                <DynamicCodeBlock
                  lang="tsx"
                  codeblock={{
                    className: 'my-0',
                    title: file.target,
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

/** The selected icon, in the drawer: its preview, animations and code. */
function IconDetail({
  entry,
  onClose,
  loop,
  onLoopChange,
}: {
  entry: IconEntry;
  onClose: () => void;
  /** Loop the preview (kept from one icon to the next). */
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
}) {
  const library = use(LibraryContext);
  const icon = useIcon(entry);
  const [animation, setAnimation] = useState('default');
  const [run, setRun] = useState(0);
  const component = entry.title.replace(/\s+/g, '');

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:gap-6">
      {/* The icon on its 24px grid, as on Lucide's and Hugeicons' sites. */}
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-accent/50 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[7.5px_7.5px] max-sm:hidden">
        {icon && (
          <icon.Icon
            key={`${animation}-${run}-${loop}`}
            size={120}
            animation={animation}
            animate
            loop={loop}
          />
        )}
        {/* As in v1: loop on the left, replay on the right. */}
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
          lang="tsx"
          codeblock={{ className: 'my-0' }}
          code={`import { ${component} } from '${library.importPath}/${entry.name}';\n\n<${component} animateOnHover${animation === 'default' ? '' : ` animation="${animation}"`} />`}
        />
      </div>
    </div>
  );
}

/**
 * A drawer at the bottom of the gallery, as on lucide.dev: it slides up from
 * the bottom of the screen and stays there while you browse (pinned to the
 * viewport, along the gallery's column), and picking another icon swaps its
 * content in place. Escape or its close button closes it.
 *
 * Scrolled to the end of the gallery, it comes off the screen's edge and is
 * drawn whole (bottom border and corners); opened or closed there, with no
 * edge to slide from, it fades in place instead.
 */
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
  // Off the screen's edge (the gallery's end above it): drawn whole.
  const [detached, setDetached] = useState(false);
  // Opened off the edge: it fades in place (and out, if it closes there).
  const [fade, setFade] = useState(false);

  const isDetached = () => {
    const holder = holderRef.current;
    return (
      !!holder && holder.getBoundingClientRect().bottom < window.innerHeight - 1
    );
  };

  // Still leaving: opened again, it comes back from where it is.
  const leavingRef = useRef(false);
  const wasOpenRef = useRef(false);
  // Where it opens, before it's painted: the drawer is in its holder now.
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

  // Kept up as the page scrolls, resizes, or changes under it without
  // scrolling (a search, a filter, the drawer's own content).
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
    // Clips the drawer as it slides from the bottom edge, leaving room around
    // it for its shadow; the grid stays clickable through that room.
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
                  ? // Keyframes: they replace the slide begun as it mounted,
                    // before it's painted.
                    { y: [0, 0], opacity: [0, 1], scale: [0.98, 1] }
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
              {/* It leaves once its own exit ends: the install tabs' panels
                  fading out inside it don't hold it on screen. */}
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
            {/* Below its bottom border, clipped at rest: covers what its
                entrance's overshoot would uncover below it. */}
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

/** A filter chip: the active one fills in and checks itself, like v1's. */
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

/** An icon library's icons, to search, filter, preview and install. */
export function IconsGallery({
  library: id = 'lucide',
}: {
  library?: IconLibraryId;
}) {
  const library: IconLibrary = ICON_LIBRARIES[id];
  const { icons: allIcons, newIcons: newOnes, tags } = library;
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  // Closed with the focus inside it (Escape, its close button): the focus
  // goes back to the icon's tile instead of the page.
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
  // 'all', 'new' or a category id.
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

  // Searched or filtered, the icons found load at once (not as each tile
  // scrolls into view): the grid's first rows show them as it changes.
  useEffect(() => {
    if (!deferred.trim() && filter === 'all') return;
    for (const entry of icons.slice(0, 60)) void loadIcon(library, entry);
  }, [icons, library, deferred, filter]);

  return (
    <LibraryContext value={library}>
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

        {/* Only with something to filter by (a tag, or some new icons). */}
        {(tags.length > 0 || newOnes.size > 0) && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All
            </FilterChip>
            {/* Only while some icons are new. */}
            {newOnes.size > 0 && (
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
    </LibraryContext>
  );
}
