'use client';

import {
  AnimateIcon,
  staticAnimations,
  type IconProps,
} from '@animate-ui/react/icons';
import {
  Cancel01Icon,
  RefreshIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';

import { ICONS, iconComponent, type IconEntry } from '@/registry/icons';
import { Check } from '@/registry/icons/check';

import { DynamicCodeBlock } from './dynamic-codeblock';

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

function IconDetail({
  entry,
  onClose,
}: {
  entry: IconEntry;
  onClose: () => void;
}) {
  const icon = useIcon(entry);
  const [animation, setAnimation] = useState('default');
  const [run, setRun] = useState(0);
  const component = entry.title.replace(/\s+/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The detail opens above the grid: bring it into view, or a tile clicked
  // far down the grid would open it off screen.
  useEffect(() => {
    ref.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="mb-6 grid scroll-mt-20 gap-6 rounded-2xl border-2 border-neutral-200 p-4 md:grid-cols-[200px_1fr] dark:border-neutral-800"
    >
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-accent/50">
        {icon && (
          <icon.Icon
            key={`${animation}-${run}`}
            size={96}
            animation={animation}
            animate
          />
        )}
        <button
          type="button"
          aria-label="Replay"
          onClick={() => setRun((r) => r + 1)}
          className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={14} />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-medium">{entry.title}</p>
            <p className="text-sm text-muted-foreground">
              {entry.keywords.slice(0, 6).join(', ')}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} size={14} />
          </button>
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
                'h-7 rounded-md px-2.5 text-xs transition-colors',
                name === animation
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <DynamicCodeBlock
          lang="bash"
          codeblock={{ className: 'my-0' }}
          code={`pnpm dlx shadcn@latest add @animate-ui/icons-${entry.name}`}
        />
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
    <div className="not-prose my-6">
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

      {selected && (
        <IconDetail
          key={selected.name}
          entry={selected}
          onClose={() => setSelected(null)}
        />
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
    </div>
  );
}
