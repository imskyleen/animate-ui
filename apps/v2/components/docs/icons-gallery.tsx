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
  useInView,
  useReducedMotion,
} from 'motion/react';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';

import {
  CATEGORIES,
  ICONS,
  iconComponent,
  type IconEntry,
} from '@/registry/icons';
import { Check } from '@/registry/icons/check';

import { DynamicCodeBlock } from './dynamic-codeblock';
import { DocsTabs } from './tabs';

type Loaded = {
  Icon: ComponentType<IconProps<string>>;
  animations: string[];
};

const cache = new Map<string, Promise<Loaded>>();

function loadIcon(entry: IconEntry) {
  let promise = cache.get(entry.name);
  if (!promise) {
    promise = entry.load().then((mod) => ({
      Icon: iconComponent(mod, entry.name)!,
      animations: [
        ...Object.keys(mod.animations),
        ...Object.keys(staticAnimations),
      ],
    }));
    cache.set(entry.name, promise);
  }
  return promise;
}

/** Loads the icon module once it scrolls into view. */
function useIcon(entry: IconEntry, enabled = true) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadIcon(entry).then((icon) => active && setLoaded(icon));
    return () => {
      active = false;
    };
  }, [entry, enabled]);
  return loaded;
}

/** Icons added in the last 30 days (v1's New filter). */
const NEW_ICONS = (() => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  return new Set(
    ICONS.filter((icon) => icon.added && new Date(icon.added) >= since).map(
      (icon) => icon.name,
    ),
  );
})();

function IconTile({
  entry,
  selected,
  onSelect,
}: {
  entry: IconEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const isNew = NEW_ICONS.has(entry.name);
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
          selected && 'text-foreground ring-2 ring-primary',
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

/** Category titles, by id. */
const CATEGORY_TITLES = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.title]),
);

/** An icon's registry item, fetched once (its source, for Manual). */
const items = new Map<string, Promise<{ content: string; target: string }>>();

function loadItem(name: string) {
  let item = items.get(name);
  if (!item) {
    item = fetch(`/r/icons-${name}.json`)
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
  const [file, setFile] = useState<{ content: string; target: string } | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    void loadItem(entry.name).then((item) => active && setFile(item));
    return () => {
      active = false;
    };
  }, [entry.name]);

  return (
    <DocsTabs
      groupId="icon-installation"
      persist
      lazy
      label="Installation"
      className="my-0"
      tabs={[
        {
          value: 'cli',
          label: 'CLI',
          content: (
            <DynamicCodeBlock
              lang="bash"
              codeblock={{ className: 'my-0' }}
              code={`pnpm dlx shadcn@latest add @animate-ui/icons-${entry.name}`}
            />
          ),
        },
        {
          value: 'manual',
          label: 'Manual',
          content: (
            <div className="flex flex-col gap-2">
              <DynamicCodeBlock
                lang="bash"
                codeblock={{ className: 'my-0' }}
                code="pnpm add @animate-ui/react motion"
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
  const icon = useIcon(entry);
  const [animation, setAnimation] = useState('default');
  const [run, setRun] = useState(0);
  const component = entry.title.replace(/\s+/g, '');

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:gap-6">
      {/* The icon on its 24px grid, as in Lucide's. */}
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

        <div className="flex flex-wrap items-center gap-1.5">
          {entry.categories.map((id) => (
            <span
              key={id}
              data-slot="category"
              className="rounded-md bg-accent px-2 py-1 text-xs"
            >
              {CATEGORY_TITLES[id]}
            </span>
          ))}
        </div>

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
          code={`import { ${component} } from '@/components/animate-ui/icons/${entry.name}';\n\n<${component} animateOnHover${animation === 'default' ? '' : ` animation="${animation}"`} />`}
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

  useEffect(() => {
    if (!entry) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entry, onClose]);

  return (
    // Clips the drawer as it slides from the bottom edge, leaving room above
    // for its shadow; the grid stays clickable through that room.
    <div className="pointer-events-none sticky bottom-0 z-20 -mt-8 overflow-hidden pt-8">
      <AnimatePresence initial={false}>
        {entry && (
          <motion.div
            key="drawer"
            role="dialog"
            aria-label={entry.title}
            data-slot="icon-drawer"
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { y: '100%', transition: motionTokens.transition.drawerOut }
            }
            transition={motionTokens.transition.drawer}
            className="pointer-events-auto mt-4 max-h-[70vh] overflow-y-auto rounded-t-2xl border border-b-0 bg-background shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.25)]"
          >
            <IconDetail
              key={entry.name}
              entry={entry}
              onClose={onClose}
              loop={loop}
              onLoopChange={setLoop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The categories offered as tags: the ones easiest to browse, not every
 * Lucide category (38 tags filled five rows).
 */
const TAGS: { id: string; title: string }[] = [
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

export function IconsGallery() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const closeDrawer = useCallback(() => setSelected(null), []);
  // 'all', 'new' or a category id.
  const [filter, setFilter] = useState('all');

  const icons = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return ICONS.filter(
      (icon) =>
        (filter === 'all' ||
          (filter === 'new'
            ? NEW_ICONS.has(icon.name)
            : icon.categories.includes(filter))) &&
        (!q ||
          icon.name.includes(q) ||
          icon.title.toLowerCase().includes(q) ||
          icon.keywords.some((keyword) => keyword.includes(q))),
    );
  }, [deferred, filter]);

  return (
    <div className="not-prose my-6 text-foreground">
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
          placeholder={`Search ${ICONS.length} icons…`}
          className="h-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <span className="text-xs text-muted-foreground tabular-nums">
          {icons.length}
        </span>
      </label>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterChip>
        {/* Only while some icons are new. */}
        {NEW_ICONS.size > 0 && (
          <FilterChip
            active={filter === 'new'}
            onClick={() => setFilter('new')}
          >
            New
          </FilterChip>
        )}
        {TAGS.map((category) => (
          <FilterChip
            key={category.id}
            active={filter === category.id}
            onClick={() => setFilter(category.id)}
          >
            {category.title}
          </FilterChip>
        ))}
      </div>

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
  );
}
