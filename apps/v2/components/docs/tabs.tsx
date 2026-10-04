'use client';

import {
  Tabs as AnimateTabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { cn } from 'cn';
import {
  Children,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { InCodeTabsContext } from './codeblock';
import { CopyButton, getPreText } from './copy-button';

export type TabItem = { value: string; label: ReactNode; content: ReactNode };

type SyncProps = {
  /** Tabs sharing a `groupId` switch together (and across pages, with `persist`). */
  groupId?: string;
  /** Remember the choice across visits (localStorage). */
  persist?: boolean;
  defaultValue?: string;
};

/** Fumadocs' tab values: lower case, whitespace as dashes. */
function escapeValue(value: string) {
  return value.toLowerCase().replace(/\s/g, '-');
}

function readStorage(groupId: string, persist: boolean) {
  try {
    return (
      sessionStorage.getItem(groupId) ??
      (persist ? localStorage.getItem(groupId) : null)
    );
  } catch {
    return null;
  }
}

function writeStorage(groupId: string, persist: boolean, value: string) {
  try {
    sessionStorage.setItem(groupId, value);
    if (persist) localStorage.setItem(groupId, value);
  } catch {
    // Storage blocked: the choice still syncs on the page.
  }
}

const listeners = new Map<string, Set<(value: string) => void>>();

/**
 * Fumadocs' tab sync, kept: same keys (sessionStorage, plus localStorage with
 * `persist`), so readers' saved package manager carries over.
 */
function useSyncedValue(
  values: string[],
  { groupId, persist = false, defaultValue }: SyncProps,
) {
  const [stored, setStored] = useState(defaultValue ?? values[0] ?? '');
  // The first switch (restoring a saved choice) happens without animation.
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (groupId) {
      const saved = readStorage(groupId, persist);
      if (saved) setStored(saved);
    }
    const frame = requestAnimationFrame(() => setReady(true));
    if (!groupId) return () => cancelAnimationFrame(frame);

    const group = listeners.get(groupId) ?? new Set();
    group.add(setStored);
    listeners.set(groupId, group);
    return () => {
      cancelAnimationFrame(frame);
      group.delete(setStored);
    };
  }, [groupId, persist]);

  const setValue = useCallback(
    (next: string) => {
      if (!groupId) return setStored(next);
      for (const listener of listeners.get(groupId) ?? []) listener(next);
      writeStorage(groupId, persist, next);
    },
    [groupId, persist],
  );

  // A saved value this block doesn't have falls back to its first tab.
  const active = values.includes(stored) ? stored : (values[0] ?? '');
  return [active, setValue, ready] as const;
}

const INSTANT = { duration: 0 };

/**
 * v1's tabs: a row of triggers under Animate UI's sliding highlight, the
 * panels in Animate UI's TabsContents (height and slide animated). With
 * `lazy`, a panel mounts the first time it's opened.
 */
export function DocsTabs({
  tabs,
  label,
  lazy = false,
  className,
  listClassName,
  toolbar,
  ...sync
}: SyncProps & {
  tabs: TabItem[];
  /** Accessible name of the tab list. */
  label?: string;
  lazy?: boolean;
  className?: string;
  listClassName?: string;
  /** Rendered at the end of the tab row. */
  toolbar?: ReactNode;
}) {
  const values = tabs.map((tab) => tab.value);
  const [active, setActive, ready] = useSyncedValue(values, sync);
  const [visited, setVisited] = useState(() => new Set([active]));

  // Adjusted while rendering, not in an effect: no extra commit.
  if (!visited.has(active)) setVisited(new Set(visited).add(active));

  return (
    <AnimateTabs
      value={active}
      onValueChange={setActive}
      className={cn('my-6 flex flex-col gap-2', className)}
    >
      <div className="not-prose flex items-center justify-between gap-2">
        <TabsHighlight
          className="absolute inset-0 z-0 rounded-lg bg-accent"
          transition={ready ? undefined : INSTANT}
        >
          <TabsList
            aria-label={label}
            className={cn(
              'inline-flex h-9 w-fit items-center text-muted-foreground',
              listClassName,
            )}
          >
            {tabs.map((tab) => (
              <TabsHighlightItem
                key={tab.value}
                value={tab.value}
                className="h-full"
              >
                <TabsTrigger
                  value={tab.value}
                  className="inline-flex h-full items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  {tab.label}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsList>
        </TabsHighlight>
        {toolbar}
      </div>
      <TabsContents transition={ready ? undefined : INSTANT}>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="outline-none"
          >
            {!lazy || visited.has(tab.value) || tab.value === active
              ? tab.content
              : null}
          </TabsContent>
        ))}
      </TabsContents>
    </AnimateTabs>
  );
}

/**
 * v1's code tabs: package managers (or files) in a row under an underline
 * highlight, Animate UI's copy button copying the open tab's code.
 */
export function CodeTabs({
  tabs,
  className,
  ...sync
}: SyncProps & { tabs: TabItem[]; className?: string }) {
  const values = tabs.map((tab) => tab.value);
  const [active, setActive, ready] = useSyncedValue(values, sync);
  const contentsRef = useRef<HTMLDivElement>(null);

  return (
    <AnimateTabs
      value={active}
      onValueChange={setActive}
      data-slot="code-tabs"
      className={cn(
        'not-prose my-6 w-full overflow-hidden rounded-xl bg-accent text-sm',
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between gap-2 pr-2.5 pl-4">
        <TabsHighlight
          className="absolute inset-0 z-0 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-foreground after:content-['']"
          transition={ready ? undefined : INSTANT}
        >
          <TabsList className="flex h-full gap-x-3 overflow-x-auto">
            {tabs.map((tab) => (
              <TabsHighlightItem
                key={tab.value}
                value={tab.value}
                className="flex h-full items-center"
              >
                <TabsTrigger
                  value={tab.value}
                  className="inline-flex h-full items-center gap-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors duration-300 hover:text-foreground focus-visible:text-foreground data-[state=active]:text-foreground [&_svg]:size-3.5"
                >
                  {tab.label}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsList>
        </TabsHighlight>
        <CopyButton
          getText={() =>
            getPreText(
              contentsRef.current?.querySelector<HTMLElement>(
                '[role="tabpanel"]:not([inert])',
              ),
            )
          }
        />
      </div>
      {/* The ref sits here: TabsContents keeps its own ref to measure. */}
      <div ref={contentsRef} className="px-1.5 pb-1.5">
        <InCodeTabsContext value>
          <TabsContents
            className="rounded-md bg-background"
            transition={ready ? undefined : INSTANT}
          >
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </TabsContents>
        </InCodeTabsContext>
      </div>
    </AnimateTabs>
  );
}

/* ---------- MDX: Fumadocs' <Tabs>/<Tab> API, Animate UI's tabs ---------- */

type TabProps = { value?: string; children?: ReactNode };

/** A panel of `<Tabs>`; its value defaults to the item at its index. */
export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({
  items = [],
  defaultIndex = 0,
  defaultValue,
  label,
  children,
  className,
  ...sync
}: Omit<SyncProps, 'defaultValue'> & {
  items?: string[];
  defaultIndex?: number;
  defaultValue?: string;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const panels = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> => isValidElement(child),
  );
  const tabs = panels.map((panel, index) => {
    const raw = panel.props.value ?? items[index] ?? String(index);
    const item = items.find((i) => escapeValue(i) === escapeValue(raw));
    return {
      value: escapeValue(raw),
      label: item ?? raw,
      content: panel.props.children,
    };
  });
  const initial = defaultValue ?? items[defaultIndex];

  return (
    <DocsTabs
      tabs={tabs}
      label={label}
      className={className}
      defaultValue={initial ? escapeValue(initial) : undefined}
      {...sync}
    />
  );
}

/* ---- MDX: the code block tabs Fumadocs' remark plugins generate (```npm) ---- */

type CodeBlockTabsTriggerProps = { value: string; children?: ReactNode };
type CodeBlockTabProps = { value: string; children?: ReactNode };

export function CodeBlockTabsList({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function CodeBlockTabsTrigger({ children }: CodeBlockTabsTriggerProps) {
  return <>{children}</>;
}

export function CodeBlockTab({ children }: CodeBlockTabProps) {
  return <>{children}</>;
}

const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

export function CodeBlockTabs({
  children,
  groupId,
  persist,
  defaultValue,
  className,
}: SyncProps & { children?: ReactNode; className?: string }) {
  const elements = Children.toArray(children).filter(
    (child): child is ReactElement<{ value?: string; children?: ReactNode }> =>
      isValidElement(child),
  );
  // The list is the child without a value; the panels have one.
  const list = elements.find((element) => element.props.value === undefined);
  const labels = new Map(
    Children.toArray(list?.props.children)
      .filter((child): child is ReactElement<CodeBlockTabsTriggerProps> =>
        isValidElement(child),
      )
      .map((trigger) => [trigger.props.value, trigger.props.children]),
  );
  const tabs = elements
    .filter((element) => element.props.value !== undefined)
    .map((element) => ({
      value: element.props.value!,
      label: labels.get(element.props.value!) ?? element.props.value,
      content: element.props.children,
    }));

  // Package manager blocks share the installation commands' choice.
  const isPackageManager = tabs.every((tab) =>
    PACKAGE_MANAGERS.includes(tab.value),
  );

  return (
    <CodeTabs
      tabs={tabs}
      className={className}
      defaultValue={defaultValue}
      groupId={groupId ?? (isPackageManager ? 'package-manager' : undefined)}
      persist={persist ?? isPackageManager}
    />
  );
}
