'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSyncedValue, type TabItem } from './tabs';

/**
 * CLI or Manual: shadcn/ui's Tabs on Animate UI's Radix Tabs. The choice is
 * remembered across pages (`groupId`, `persist`); a panel mounts when opened.
 */
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
      <TabsList aria-label={label} className="not-prose">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-3">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          // The tab row sets the spacing: a panel's own block margins (code
          // blocks, steps) would add to it.
          className="*:first:mt-0 *:last:mb-0 [&_.fd-step:first-child>h3:first-child]:mt-0"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
