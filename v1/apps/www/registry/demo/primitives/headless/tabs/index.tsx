import {
  TabGroup,
  TabPanel,
  TabPanels,
  TabHighlight,
  TabHighlightItem,
  TabList,
  Tab,
} from '@/registry/primitives/headless/tabs';

interface HeadlessTabsDemoProps {
  mode: 'auto-height' | 'layout';
}

export function HeadlessTabsDemo({ mode }: HeadlessTabsDemoProps) {
  return (
    <TabGroup className="w-[400px]">
      <TabHighlight className="bg-background absolute z-0 inset-0">
        <TabList className="h-10 inline-flex p-1 bg-accent w-full">
          <TabHighlightItem index={0} className="flex-1">
            <Tab
              index={0}
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Account
            </Tab>
          </TabHighlightItem>
          <TabHighlightItem index={1} className="flex-1">
            <Tab
              index={1}
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Password
            </Tab>
          </TabHighlightItem>
        </TabList>
      </TabHighlight>
      <TabPanels
        mode={mode}
        className="bg-background p-3 border-4 border-accent border-t-0"
      >
        <TabPanel className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you&apos;re done.
          </p>

          <div className="space-y-3">
            <div className="space-y-1 flex flex-col">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                id="name"
                defaultValue="Pedro Duarte"
                className="border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1 flex flex-col">
              <label htmlFor="username" className="text-sm">
                Username
              </label>
              <input
                id="username"
                defaultValue="@peduarte"
                className="border px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <button className="bg-primary text-primary-foreground px-3 py-1.5 text-sm">
            Save changes
          </button>
        </TabPanel>
        <TabPanel className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
          <div className="space-y-3">
            <div className="space-y-1 flex flex-col">
              <label htmlFor="current" className="text-sm">
                Current password
              </label>
              <input
                id="current"
                type="password"
                className="border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1 flex flex-col">
              <label htmlFor="new" className="text-sm">
                New password
              </label>
              <input
                id="new"
                type="password"
                className="border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1 flex flex-col">
              <label htmlFor="confirm" className="text-sm">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                className="border px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <button className="bg-primary text-primary-foreground px-3 py-1.5 text-sm">
            Save password
          </button>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
