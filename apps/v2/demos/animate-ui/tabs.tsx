"use client"

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@animate-ui/react/primitives/tabs"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const inputClassName =
  "h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

export default function TabsDemo() {
  return (
    <Tabs className="w-full max-w-sm">
      <TabsHighlight className="absolute inset-0 z-0 rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
        <TabsList className="inline-flex h-9 w-full rounded-lg bg-muted p-1">
          <TabsHighlightItem value="account" className="flex-1">
            <TabsTrigger
              value="account"
              className="h-full w-full text-sm font-medium text-muted-foreground transition-colors duration-500 ease-in-out data-[state=active]:text-foreground"
            >
              Account
            </TabsTrigger>
          </TabsHighlightItem>
          <TabsHighlightItem value="password" className="flex-1">
            <TabsTrigger
              value="password"
              className="h-full w-full text-sm font-medium text-muted-foreground transition-colors duration-500 ease-in-out data-[state=active]:text-foreground"
            >
              Password
            </TabsTrigger>
          </TabsHighlightItem>
        </TabsList>
      </TabsHighlight>
      <TabsContents className="mt-2 rounded-xl border bg-card">
        <TabsContent value="account" className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you&apos;re done.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tabs-name">Name</Label>
            <input
              id="tabs-name"
              defaultValue="Pedro Duarte"
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tabs-username">Username</Label>
            <input
              id="tabs-username"
              defaultValue="@peduarte"
              className={inputClassName}
            />
          </div>
          <Button className="self-start">Save changes</Button>
        </TabsContent>
        <TabsContent value="password" className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tabs-current">Current password</Label>
            <input id="tabs-current" type="password" className={inputClassName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tabs-new">New password</Label>
            <input id="tabs-new" type="password" className={inputClassName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tabs-confirm">Confirm password</Label>
            <input
              id="tabs-confirm"
              type="password"
              className={inputClassName}
            />
          </div>
          <Button className="self-start">Save password</Button>
        </TabsContent>
      </TabsContents>
    </Tabs>
  )
}
