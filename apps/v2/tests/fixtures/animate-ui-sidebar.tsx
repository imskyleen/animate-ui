'use client';

import * as React from 'react';
import * as SidebarPrimitive from '@animate-ui/react/primitives/sidebar';

function Bar({ label }: { label: string }) {
  const { state, toggleSidebar, open } = SidebarPrimitive.useSidebar();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-testid={`${label}-toggle`}
        onClick={toggleSidebar}
        className="rounded border px-2"
      >
        Toggle {label}
      </button>
      <span data-testid={`${label}-state`}>
        {state} {String(open)}
      </span>
    </div>
  );
}

function Offcanvas({
  label,
  animateOnHover,
}: {
  label: string;
  animateOnHover?: boolean;
}) {
  const { state } = SidebarPrimitive.useSidebar();
  return (
    <div
      data-testid={label}
      data-state={state}
      className="group relative flex h-48 w-[600px] overflow-hidden border"
    >
      <SidebarPrimitive.Gap
        data-slot="sidebar-gap"
        className="w-64 shrink-0 group-data-[state=collapsed]:w-0"
      />
      <SidebarPrimitive.Container
        data-slot="sidebar-container"
        className="absolute inset-y-0 left-0 w-64 group-data-[state=collapsed]:-left-64"
      >
        <SidebarPrimitive.Highlight
          animateOnHover={animateOnHover}
          className="flex size-full flex-col bg-zinc-100 p-2"
        >
          <ul className="flex flex-col">
            {['Inbox', 'Drafts', 'Sent'].map((name) => (
              <li key={name} className="relative">
                <button
                  type="button"
                  data-sidebar="menu-button"
                  data-active={name === 'Drafts'}
                  className="flex h-8 w-full items-center overflow-hidden rounded-md px-2 text-sm hover:bg-zinc-300 data-active:bg-zinc-200"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </SidebarPrimitive.Highlight>
      </SidebarPrimitive.Container>
      <main className="flex-1 bg-white p-2 text-sm">Page</main>
    </div>
  );
}

function Icons() {
  const { state } = SidebarPrimitive.useSidebar();
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div
      data-testid="icons"
      data-state={state}
      className="group relative flex h-32 w-[600px] overflow-hidden border"
    >
      <SidebarPrimitive.Gap className="w-64 shrink-0 group-data-[state=collapsed]:w-12" />
      <SidebarPrimitive.Container className="absolute inset-y-0 left-0 w-64 group-data-[state=collapsed]:w-12">
        <SidebarPrimitive.Highlight className="flex size-full flex-col bg-zinc-100 p-2">
          <ul className="flex flex-col">
            <li className="relative">
              <button
                type="button"
                data-sidebar="menu-button"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
                className="flex h-8 w-full items-center overflow-hidden rounded-md px-2 text-sm whitespace-nowrap transition-[width] duration-300 group-data-[state=collapsed]:w-8 hover:bg-zinc-300 aria-expanded:bg-zinc-300"
              >
                Pinned
              </button>
            </li>
          </ul>
        </SidebarPrimitive.Highlight>
      </SidebarPrimitive.Container>
    </div>
  );
}

class Catch extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <p data-testid="outside-error">{this.state.error}</p>
    ) : (
      this.props.children
    );
  }
}

function Outside() {
  SidebarPrimitive.useSidebar();
  return null;
}

export default function SidebarFixture() {
  const [open, setOpen] = React.useState(true);
  const [changes, setChanges] = React.useState<boolean[]>([]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SidebarPrimitive.Provider defaultOpen={false}>
          <Bar label="collapsed" />
          <Offcanvas label="collapsed" />
        </SidebarPrimitive.Provider>
      </section>

      <section>
        <SidebarPrimitive.Provider
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            setChanges((list) => [...list, next]);
          }}
        >
          <Bar label="controlled" />
          <button
            type="button"
            data-testid="controlled-outside"
            onClick={() => setOpen((value) => !value)}
          >
            From outside
          </button>
          <span data-testid="controlled-changes">{changes.join(',')}</span>
          <Offcanvas label="controlled" />
        </SidebarPrimitive.Provider>
      </section>

      <section>
        <SidebarPrimitive.Provider animateOnHover={false}>
          <Bar label="plain" />
          <Offcanvas label="plain" />
        </SidebarPrimitive.Provider>
      </section>

      <section>
        <SidebarPrimitive.Provider>
          <Bar label="icons" />
          <Icons />
        </SidebarPrimitive.Provider>
      </section>

      <Catch>
        <Outside />
      </Catch>
    </div>
  );
}
