'use client';

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
  type TabsProps,
} from '@animate-ui/react/primitives/tabs';

const TABS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two', disabled: true },
  { value: 'three', label: 'Three' },
  { value: 'four', label: 'Four' },
];

function Example({
  label,
  orientation,
  dir,
}: {
  label: string;
  orientation?: TabsProps['orientation'];
  dir?: 'rtl';
}) {
  return (
    <Tabs orientation={orientation} dir={dir} className="w-80">
      <TabsHighlight className="absolute inset-0 z-0 rounded-md bg-accent">
        <TabsList
          aria-label={label}
          className={
            orientation === 'vertical' ? 'flex flex-col' : 'flex gap-1'
          }
        >
          {TABS.map((tab) => (
            <TabsHighlightItem key={tab.value} value={tab.value}>
              <TabsTrigger
                value={tab.value}
                disabled={tab.disabled}
                className="h-8 px-3 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
      <TabsContents className="mt-2">
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="p-2">
            {label} {tab.label} panel
          </TabsContent>
        ))}
      </TabsContents>
    </Tabs>
  );
}

export default function AnimateUITabsFixture() {
  return (
    <div className="flex flex-col gap-10">
      <button type="button">Before</button>
      <Example label="Horizontal" />
      <Example label="Vertical" orientation="vertical" />
      <Example label="RTL" dir="rtl" />
      <Tabs>
        <TabsList aria-label="Custom ids" className="flex gap-1">
          <TabsTrigger id="my-trigger" value="alpha">
            Alpha
          </TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
        </TabsList>
        <TabsContents>
          <TabsContent id="my-panel" value="alpha">
            Alpha panel
          </TabsContent>
          <TabsContent value="beta">Beta panel</TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
