import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@/registry/primitives/animate/tabs';

export function AnimateTabsDemo() {
  return (
    <Tabs className="w-[400px]">
      <TabsHighlight className="bg-background absolute z-0 inset-0">
        <TabsList className="h-10 inline-flex p-1 bg-accent w-full">
          <TabsHighlightItem value="account" className="flex-1">
            <TabsTrigger
              value="account"
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Account
            </TabsTrigger>
          </TabsHighlightItem>
          <TabsHighlightItem value="password" className="flex-1">
            <TabsTrigger
              value="password"
              className="h-full px-4 py-2 leading-0 w-full text-sm"
            >
              Password
            </TabsTrigger>
          </TabsHighlightItem>
        </TabsList>
      </TabsHighlight>
      <TabsContents className="bg-background p-3 border-4 border-accent border-t-0">
        <TabsContent value="account" className="space-y-4">
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
        </TabsContent>
        <TabsContent value="password" className="space-y-4">
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
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
}
