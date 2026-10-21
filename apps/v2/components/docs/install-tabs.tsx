'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSyncedValue, type TabItem } from './tabs';

export function InstallTabs({
  tabs,
  label = 'Installation',
  groupId = 'installation',
  className,
}: {
  tabs: TabItem[];
  label?: string;
  groupId?: string;
  className?: string;
}) {
  const [active, setActive] = useSyncedValue(
    tabs.map((tab) => tab.value),
    { groupId, persist: true },
  );

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      data-slot="install-tabs"
      className={className ?? 'my-6'}
    >
      <TabsList
        aria-label={label}
        className="not-prose gap-1 rounded-xl bg-accent/50 p-1 group-data-horizontal/tabs:h-9"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-7 rounded-lg px-3 text-muted-foreground group-data-[variant=default]/tabs-list:data-active:shadow-xs dark:data-active:border-transparent dark:data-active:bg-accent"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="*:first:mt-0 *:last:mb-0 [&_.fd-step:first-child>h3:first-child]:mt-0"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
