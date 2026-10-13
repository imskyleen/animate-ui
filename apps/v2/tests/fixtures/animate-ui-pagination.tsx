'use client';

import * as React from 'react';
import * as PaginationPrimitive from '@animate-ui/react/primitives/pagination';
import { AnimateUIProvider } from '@animate-ui/react/provider';

type Transition = React.ComponentProps<
  typeof PaginationPrimitive.Root
>['transition'];

const LINK =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm outline-none transition-[translate] duration-150 hover:bg-zinc-200 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/50 active:translate-y-px';
const CURRENT = 'border-zinc-400 bg-white shadow-sm';
const OTHER = 'border-transparent';
const SHADCN_LINK = LINK.replace(
  'transition-[translate] duration-150',
  'transition-all duration-150',
);
const PRESS_LINK = LINK.replace(
  'transition-[translate] duration-150',
  'transition-transform duration-300',
);

const ENTRANCE_CSS =
  '@keyframes pagination-entrance{from{transform:perspective(500px) rotateX(-20deg) scale(0.8)}}';

type Item =
  | { key: string; label: string; page: number; className?: string }
  | { key: string; ellipsis: true };

type PagesProps = {
  label: string;
  items: Item[];
  page: number;
  onPage: (page: number) => void;
  transition?: Transition;
  children?: React.ReactNode;
  before?: React.ReactNode;
  link?: string;
  current?: string;
  other?: string;
  list?: string;
  item?: string;
  nav?: string;
  duplicate?: boolean;
};

function Pages({
  label,
  items,
  page,
  onPage,
  transition,
  children,
  before,
  link = LINK,
  current = CURRENT,
  other = OTHER,
  list = 'flex items-center gap-1',
  item: itemClassName,
  nav = 'w-fit',
  duplicate,
}: PagesProps) {
  const listOf = (className: string, hidden = false) => (
    <ul className={className}>
      {!hidden && before}
      {items.map((item) =>
        'ellipsis' in item ? (
          <li key={item.key} className={itemClassName}>
            <span
              aria-hidden
              data-slot="pagination-ellipsis"
              className="flex h-8 w-12 items-center justify-center"
            >
              …
            </span>
          </li>
        ) : (
          <li key={item.key} className={itemClassName}>
            <a
              href={`#${label}-${item.page}`}
              data-slot="pagination-link"
              aria-current={item.page === page ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                onPage(item.page);
              }}
              className={`${link} ${item.page === page ? current : other} ${item.className ?? ''}`}
            >
              {item.label}
            </a>
          </li>
        ),
      )}
      {!hidden && children}
    </ul>
  );
  return (
    <PaginationPrimitive.Root
      data-testid={label}
      aria-label={label}
      transition={transition}
      className={nav}
    >
      {duplicate && listOf(`${list} hidden`, true)}
      {listOf(list)}
    </PaginationPrimitive.Root>
  );
}

const numbers = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    key: String(i + 1),
    label: String(i + 1),
    page: i + 1,
  }));

function Uncontrolled({
  initial = 1,
  count = 5,
  ...props
}: Omit<PagesProps, 'items' | 'page' | 'onPage'> & {
  initial?: number;
  count?: number;
}) {
  const [page, setPage] = React.useState(initial);
  return (
    <Pages {...props} items={numbers(count)} page={page} onPage={setPage} />
  );
}

function Controlled() {
  const [page, setPage] = React.useState(1);
  const [renders, setRenders] = React.useState(0);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pages
        label="controlled"
        items={numbers(5)}
        page={page}
        onPage={setPage}
      />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          data-testid={`controlled-go-${n}`}
          onClick={() => setPage(n)}
          className="rounded border px-2 text-sm"
        >
          Go to {n}
        </button>
      ))}
      <button
        type="button"
        data-testid="controlled-rerender"
        onClick={() => setRenders((n) => n + 1)}
        className="rounded border px-2 text-sm"
      >
        Re-render
      </button>
      <span data-testid="controlled-renders">{renders}</span>
      <span data-testid="controlled-page">{page}</span>
    </div>
  );
}

function windowOf(page: number): Item[] {
  const shown = [...new Set([1, page - 1, page, page + 1, 10])]
    .filter((n) => n >= 1 && n <= 10)
    .sort((a, b) => a - b);
  const items: Item[] = [];
  shown.forEach((n, i) => {
    const before = shown[i - 1];
    if (before !== undefined && n - before > 1)
      items.push({ key: before < page ? 'start' : 'end', ellipsis: true });
    items.push({ key: String(n), label: String(n), page: n });
  });
  return items;
}

function Window() {
  const [page, setPage] = React.useState(5);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pages
        label="window"
        items={windowOf(page)}
        page={page}
        onPage={setPage}
      />
      {Array.from({ length: 10 }, (_, i) => (
        <button
          key={i}
          type="button"
          data-testid={`window-go-${i + 1}`}
          onClick={() => setPage(i + 1)}
          className="rounded border px-2 text-sm"
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function Widths() {
  const [page, setPage] = React.useState(1);
  return (
    <Pages
      label="widths"
      items={[
        { key: 'a', label: 'A', page: 1 },
        { key: 'wide', label: 'Wide page', page: 2, className: 'w-28' },
        { key: 'tall', label: 'Tall', page: 3, className: 'h-12' },
      ]}
      page={page}
      onPage={setPage}
    />
  );
}

function Remount() {
  const [state, setState] = React.useState({ key: 0, page: 1 });
  return (
    <div className="flex items-center gap-3">
      <Pages
        key={state.key}
        label="remount"
        items={numbers(5)}
        page={state.page}
        onPage={(page) => setState((s) => ({ ...s, page }))}
        link={SHADCN_LINK}
        current="border-zinc-900/30 bg-white shadow-sm"
      />
      <button
        type="button"
        data-testid="remount-button"
        onClick={() =>
          setState((s) => ({ key: s.key + 1, page: s.page === 1 ? 4 : 1 }))
        }
        className="rounded border px-2 text-sm"
      >
        Remount
      </button>
    </div>
  );
}

const named = (name: string) =>
  [1, 2, 3].map((n) => ({ key: String(n), label: `${name} ${n}`, page: n }));

function Nested() {
  const [outer, setOuter] = React.useState(1);
  const [inner, setInner] = React.useState(1);
  return (
    <Pages
      label="nested-outer"
      items={named('Outer')}
      page={outer}
      onPage={setOuter}
    >
      <li>
        <Pages
          label="nested-inner"
          items={named('Inner')}
          page={inner}
          onPage={setInner}
        />
      </li>
    </Pages>
  );
}

function NestedFirst() {
  const [outer, setOuter] = React.useState(1);
  const [inner, setInner] = React.useState(1);
  return (
    <div className="flex items-center gap-3">
      <Pages
        label="nested-first-outer"
        items={named('Outer')}
        page={outer}
        onPage={setOuter}
        before={
          <li>
            <Pages
              label="nested-first-inner"
              items={named('Inner')}
              page={inner}
              onPage={setInner}
            />
          </li>
        }
      />
      <button
        type="button"
        data-testid="nested-first-none"
        onClick={() => setOuter(0)}
        className="rounded border px-2 text-sm"
      >
        No page
      </button>
    </div>
  );
}

function Entrance() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-testid="entrance-open"
        onClick={() => setOpen((o) => !o)}
        className="rounded border px-2 text-sm"
      >
        Open
      </button>
      {open && (
        <div
          data-testid="entrance-wrap"
          style={{ animation: 'pagination-entrance 400ms ease-out' }}
        >
          <Uncontrolled label="entrance" initial={3} nav="w-fit p-4" />
        </div>
      )}
    </div>
  );
}

function RestoredInLayoutEffect() {
  const [page, setPage] = React.useState(1);
  React.useLayoutEffect(() => setPage(3), []);
  return (
    <Pages
      label="restored-layout"
      items={numbers(5)}
      page={page}
      onPage={setPage}
    />
  );
}

function RestoredInEffect() {
  const [page, setPage] = React.useState(1);
  React.useEffect(() => setPage(3), []);
  return (
    <Pages
      label="restored-effect"
      items={numbers(5)}
      page={page}
      onPage={setPage}
    />
  );
}

function RestoredOnceShown() {
  const [page, setPage] = React.useState(1);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const root = ref.current!.querySelector('[data-animate-ui-pagination]')!;
    const observer = new MutationObserver(() => {
      if (!root.hasAttribute('data-animate-ui-pagination-ready')) return;
      observer.disconnect();
      setPage(3);
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-animate-ui-pagination-ready'],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <Pages
        label="restored-ready"
        items={numbers(5)}
        page={page}
        onPage={setPage}
      />
    </div>
  );
}

function Restored() {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        data-testid="restored-toggle"
        onClick={() => setShown((s) => !s)}
        className="rounded border px-2 text-sm"
      >
        Toggle
      </button>
      {shown && (
        <>
          <RestoredInLayoutEffect />
          <RestoredInEffect />
          <RestoredOnceShown />
        </>
      )}
    </div>
  );
}

export default function PaginationFixture() {
  return (
    <div className="flex flex-col items-start gap-6">
      <style>{ENTRANCE_CSS}</style>
      <Controlled />
      <AnimateUIProvider tempo={2}>
        <Uncontrolled label="tempo" />
      </AnimateUIProvider>
      <Uncontrolled
        label="custom"
        transition={{ duration: 0.4, ease: 'linear' }}
      />
      <Window />
      <Widths />
      <Remount />
      <Nested />
      <div data-testid="scaled-wrap" className="origin-top-left">
        <Uncontrolled label="scaled" list="flex items-center gap-[4.3px]" />
      </div>
      <Entrance />
      <Uncontrolled
        label="label"
        initial={2}
        nav="w-[480px]"
        before={
          <li>
            <span data-testid="label-text" className="text-sm">
              Page
            </span>
          </li>
        }
      />
      <Uncontrolled
        label="scroll"
        count={8}
        initial={4}
        list="flex max-w-[150px] items-center gap-1 overflow-x-auto"
        item="shrink-0"
      />
      <Uncontrolled label="content-box" link={`${LINK} box-content`} />
      <Uncontrolled label="press" link={`${PRESS_LINK} active:scale-[0.97]`} />
      <Uncontrolled
        label="press-transform"
        link={`${PRESS_LINK} active:[transform:scale(0.97)]`}
      />
      <Uncontrolled
        label="percent"
        initial={2}
        link={`${LINK} translate-y-[-10%]`}
      />
      <Uncontrolled
        label="ul-bg"
        initial={2}
        list="relative flex items-center gap-1 rounded-lg bg-zinc-200 p-1"
        item="rounded-md bg-zinc-100"
      />
      <NestedFirst />
      <Uncontrolled label="hidden-dup" initial={3} duplicate />
      <Restored />
    </div>
  );
}
