import {
  Tabs,
  TabsPanel,
  TabsPanels,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTab,
  type TabsPanelsProps,
} from '@/registry/primitives/base/tabs';

interface BaseTabsDemoProps {
  mode: TabsPanelsProps['mode'];
}

export function BaseTabsDemo({ mode }: BaseTabsDemoProps) {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsHighlight className="bg-background absolute z-0 inset-0">
        <TabsList className="h-10 inline-flex p-1 bg-accent w-full">
          <TabsHighlightItem value="account" className="flex-1">
            <TabsTab
              value="account"
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Account
            </TabsTab>
          </TabsHighlightItem>
          <TabsHighlightItem value="password" className="flex-1">
            <TabsTab
              value="password"
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Password
            </TabsTab>
          </TabsHighlightItem>
        </TabsList>
      </TabsHighlight>
      <TabsPanels
        mode={mode}
        className="bg-background p-3 border-4 border-accent border-t-0"
      >
        <TabsPanel value="account" className="space-y-4">
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
        </TabsPanel>
        <TabsPanel value="password" className="space-y-4">
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
        </TabsPanel>
      </TabsPanels>
    </Tabs>
  );
}
