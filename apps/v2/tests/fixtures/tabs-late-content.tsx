'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@animate-ui/react/primitives/base-ui/tabs';
import { Tabs as RadixTabs } from '@animate-ui/react/primitives/radix-ui';
import {
  Tab,
  TabList,
  TabPanel,
  Tabs as AriaTabs,
} from '@animate-ui/react/primitives/react-aria';

/** A box a panel holds (a frame): its height glides, its content fades. */
const BOX = {
  border: '1px solid rgb(212, 212, 212)',
  borderRadius: 8,
  background: 'white',
  padding: 12,
};

/**
 * Content that grows after it mounts, while its panel comes in: 20px, then
 * 200px 300ms later, mid-glide (content loaded late, a nested animation
 * settling).
 */
function Grows() {
  const [grown, setGrown] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 300);
    return () => clearTimeout(timer);
  }, []);
  return <div data-testid="grows" style={{ height: grown ? 200 : 20 }} />;
}

/** Content added mid-glide as a new child (a list loaded late). */
function Added() {
  const [items, setItems] = React.useState(0);
  React.useEffect(() => {
    const timer = setTimeout(() => setItems(5), 300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <p style={{ margin: 0 }}>Long panel</p>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} style={{ height: 40 }}>
          Item {i + 1}
        </div>
      ))}
    </>
  );
}

/** Text that grows mid-glide, right in the panel (no element around it). */
function Text() {
  const [long, setLong] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setLong(true), 300);
    return () => clearTimeout(timer);
  }, []);
  return <>{long ? 'Loaded. '.repeat(120) : 'Loading'}</>;
}

/** Content that never stops resizing (an endless animation). */
function Endless() {
  return (
    <div
      style={{
        height: 20,
        animation: 'tabs-endless 0.4s ease-in-out infinite alternate',
      }}
    >
      <style>{'@keyframes tabs-endless{to{height:120px}}'}</style>
    </div>
  );
}

/**
 * A child animating its own height right after its panel shows (an accordion
 * opened at once): 400ms after it mounts, once its panel waited its turn.
 */
function Animates() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      data-testid="animates"
      style={{
        height: open ? 150 : 0,
        transition: 'height 300ms linear',
        background: 'rgb(200, 200, 200)',
      }}
    />
  );
}

/** Sized by its own ResizeObserver, in the frame it shows (a chart). */
function SelfSized() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current!;
    const observer = new ResizeObserver(() => {
      el.style.height = `${el.offsetWidth / 2}px`;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} />;
}

function RadixCase({
  id,
  children,
  panel,
}: {
  id: string;
  children: React.ReactNode;
  /** Props of the panel coming in. */
  panel?: Partial<React.ComponentProps<typeof RadixTabs.Content>>;
}) {
  return (
    <section data-testid={id} style={{ width: 400 }}>
      <RadixTabs.Root defaultValue="a">
        <RadixTabs.List aria-label={id}>
          <RadixTabs.Trigger value="a">{`${id} a`}</RadixTabs.Trigger>
          <RadixTabs.Trigger value="b">{`${id} b`}</RadixTabs.Trigger>
        </RadixTabs.List>
        <RadixTabs.Content value="a">
          <p style={{ margin: 0 }}>Short panel</p>
        </RadixTabs.Content>
        <RadixTabs.Content value="b" {...panel}>
          {children}
        </RadixTabs.Content>
      </RadixTabs.Root>
      <p data-testid={`${id}-below`}>Below the tabs</p>
    </section>
  );
}

// The incoming panel's content resizing while its height glides: the glide
// follows it, instead of ending on the height it read as it started.
export default function TabsLateContentFixture() {
  return (
    <div className="flex flex-col gap-10">
      <section data-testid="radix">
        <RadixTabs.Root defaultValue="a">
          <RadixTabs.List aria-label="Radix">
            <RadixTabs.Trigger value="a">Radix a</RadixTabs.Trigger>
            <RadixTabs.Trigger value="b">Radix b</RadixTabs.Trigger>
          </RadixTabs.List>
          <RadixTabs.Content value="a">
            <p>Short panel</p>
          </RadixTabs.Content>
          <RadixTabs.Content value="b">
            <p>Long panel</p>
            <Grows />
          </RadixTabs.Content>
        </RadixTabs.Root>
      </section>

      <section data-testid="radix-frame">
        <RadixTabs.Root defaultValue="a">
          <RadixTabs.List aria-label="Radix framed">
            <RadixTabs.Trigger value="a">Framed a</RadixTabs.Trigger>
            <RadixTabs.Trigger value="b">Framed b</RadixTabs.Trigger>
          </RadixTabs.List>
          <RadixTabs.Content value="a">
            <div data-testid="frame-a" style={BOX}>
              <p>Short panel</p>
            </div>
          </RadixTabs.Content>
          <RadixTabs.Content value="b">
            <div data-testid="frame-b" style={BOX}>
              <p>Long panel</p>
              <Grows />
            </div>
          </RadixTabs.Content>
        </RadixTabs.Root>
      </section>

      <section data-testid="base">
        <BaseTabs.Root defaultValue="a">
          <BaseTabs.List aria-label="Base">
            <BaseTabs.Tab value="a">Base a</BaseTabs.Tab>
            <BaseTabs.Tab value="b">Base b</BaseTabs.Tab>
          </BaseTabs.List>
          <BaseTabs.Panel value="a">
            <p>Short panel</p>
          </BaseTabs.Panel>
          <BaseTabs.Panel value="b">
            <p>Long panel</p>
            <Grows />
          </BaseTabs.Panel>
        </BaseTabs.Root>
      </section>

      {/* A panel ending in a margin that escapes through its bottom: the
          glide carries it, so what's below doesn't jump as it starts and
          ends. */}
      <RadixCase id="margin">
        <p style={{ margin: '0 0 24px' }}>Long panel</p>
        <div style={{ height: 120 }} />
        <p style={{ margin: '0 0 20px' }}>Ends in a margin</p>
      </RadixCase>
      <RadixCase id="added">
        <Added />
      </RadixCase>
      <RadixCase id="text">
        <Text />
      </RadixCase>
      {/* The same height as panel a: nothing to glide as it shows. */}
      <RadixCase id="animated">
        <p style={{ margin: 0 }}>Long panel</p>
        <Animates />
      </RadixCase>
      <RadixCase id="self-sized">
        <p style={{ margin: 0 }}>Long panel</p>
        <SelfSized />
      </RadixCase>
      {/* Its own inline style, with a custom property and a priority: the
          margin probe leaves it as it was. */}
      <div style={{ ['--pad' as string]: '0px' }}>
        <RadixCase
          id="inline"
          panel={{
            style: {
              padding: 'var(--pad)',
              transition: 'all 300ms',
            },
          }}
        >
          <p style={{ margin: '0 0 20px' }}>Long panel</p>
          <div style={{ height: 120 }} />
          <p style={{ margin: '0 0 20px' }}>Ends in a margin</p>
        </RadixCase>
      </div>
      <RadixCase id="negative">
        <p style={{ margin: 0 }}>Long panel</p>
        <div style={{ height: 120 }} />
        <div style={{ height: 30, marginBottom: -20 }} />
      </RadixCase>
      <RadixCase id="endless">
        <p style={{ margin: 0 }}>Long panel</p>
        <Endless />
      </RadixCase>

      <section data-testid="aria">
        <AriaTabs defaultSelectedKey="a">
          <TabList aria-label="Aria">
            <Tab id="a">Aria a</Tab>
            <Tab id="b">Aria b</Tab>
          </TabList>
          <TabPanel id="a">
            <p>Short panel</p>
          </TabPanel>
          <TabPanel id="b">
            <p>Long panel</p>
            <Grows />
          </TabPanel>
        </AriaTabs>
      </section>
    </div>
  );
}
