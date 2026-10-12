'use client';

import * as React from 'react';

import * as Base from '@/demos/base-ui/tabs';
import * as Radix from '@/demos/radix-ui/tabs';
import * as Aria from '@/demos/react-aria/tabs';

// shadcn's tabs (the demos' own parts) mounted after the page has loaded, the
// way a dialog's or a popover's are, for tests/interaction/tabs-helpers.ts
// (describeTabsMounted). In dark mode: the active tab's own border and
// background are translucent (shadcn's `border-input`, `bg-input/30`), and its
// `transition-all` would fade them out over the indicator. Each library has
// two sections, `data-testid`:
//
// - `<library>-settle`: "Show tabs" mounts them, "Hide tabs" unmounts them;
// - `<library>-entrance`: "Show in entrance" mounts them in a box coming in
//   like Animate UI's dialog (from `perspective(500px) rotateX(-20deg)
//   scale(0.8)` to none, 300ms): their first read is under that transform.

const TABS = ['One', 'Two', 'Three'];

function RadixTabs() {
  return (
    <Radix.Tabs defaultValue="Three" className="w-[300px]">
      <Radix.TabsList>
        {TABS.map((tab) => (
          <Radix.TabsTrigger key={tab} value={tab}>
            {tab}
          </Radix.TabsTrigger>
        ))}
      </Radix.TabsList>
      {TABS.map((tab) => (
        <Radix.TabsContent key={tab} value={tab}>
          {tab} panel
        </Radix.TabsContent>
      ))}
    </Radix.Tabs>
  );
}

function BaseTabs() {
  return (
    <Base.Tabs defaultValue="Three" className="w-[300px]">
      <Base.TabsList>
        {TABS.map((tab) => (
          <Base.TabsTrigger key={tab} value={tab}>
            {tab}
          </Base.TabsTrigger>
        ))}
      </Base.TabsList>
      {TABS.map((tab) => (
        <Base.TabsContent key={tab} value={tab}>
          {tab} panel
        </Base.TabsContent>
      ))}
    </Base.Tabs>
  );
}

function AriaTabs() {
  return (
    <Aria.Tabs defaultSelectedKey="Three" className="w-[300px]">
      <Aria.TabsList>
        {TABS.map((tab) => (
          <Aria.TabsTrigger key={tab} id={tab}>
            {tab}
          </Aria.TabsTrigger>
        ))}
      </Aria.TabsList>
      {TABS.map((tab) => (
        <Aria.TabsContent key={tab} id={tab}>
          {tab} panel
        </Aria.TabsContent>
      ))}
    </Aria.Tabs>
  );
}

const LIBRARIES = [
  { id: 'radix-ui', Tabs: RadixTabs },
  { id: 'base-ui', Tabs: BaseTabs },
  { id: 'react-aria', Tabs: AriaTabs },
];

/** Animate UI's dialog entrance, roughly. */
const ENTRANCE =
  '@keyframes tabs-mount-entrance{from{transform:perspective(500px) rotateX(-20deg) scale(0.8)}}';

function Settle({ Tabs }: { Tabs: () => React.ReactNode }) {
  const [shown, setShown] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setShown((value) => !value)}>
        {shown ? 'Hide tabs' : 'Show tabs'}
      </button>
      {shown && <Tabs />}
    </>
  );
}

function Entrance({ Tabs }: { Tabs: () => React.ReactNode }) {
  const [shown, setShown] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setShown(true)}>
        Show in entrance
      </button>
      {shown && (
        <div
          data-testid="entrance-box"
          style={{ animation: 'tabs-mount-entrance 300ms ease-out' }}
        >
          <Tabs />
        </div>
      )}
    </>
  );
}

export default function TabsIndicatorMountFixture() {
  return (
    <div className="dark flex flex-col gap-6 bg-background p-6 text-foreground">
      <style>{ENTRANCE}</style>
      {LIBRARIES.map(({ id, Tabs }) => (
        <React.Fragment key={id}>
          <section data-testid={`${id}-settle`} className="flex flex-col gap-2">
            <Settle Tabs={Tabs} />
          </section>
          <section
            data-testid={`${id}-entrance`}
            className="flex flex-col gap-2"
          >
            <Entrance Tabs={Tabs} />
          </section>
        </React.Fragment>
      ))}
    </div>
  );
}
