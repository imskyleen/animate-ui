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

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
]

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsHighlight className="absolute inset-0 z-0 rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
        <TabsList className="inline-flex h-8 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
          {TABS.map((tab) => (
            <TabsHighlightItem key={tab.value} value={tab.value}>
              <TabsTrigger
                value={tab.value}
                className="inline-flex h-full items-center justify-center rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-500 ease-in-out hover:text-foreground data-[state=active]:text-foreground dark:text-muted-foreground dark:data-[state=active]:text-foreground"
              >
                {tab.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
      <TabsContents className="mt-2 rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10">
        <TabsContent
          value="overview"
          className="flex flex-col gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]"
        >
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                View your key metrics and recent project activity. Track
                progress across all your active projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You have 12 active projects and 3 pending tasks.
            </CardContent>
        </TabsContent>
        <TabsContent
          value="analytics"
          className="flex flex-col gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]"
        >
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track performance and user engagement metrics. Monitor trends
                and identify growth opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {[
                ["Page views", "+25%"],
                ["Visitors", "3,240"],
                ["Bounce rate", "41%"],
                ["Avg. session", "2m 14s"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </CardContent>
        </TabsContent>
        <TabsContent
          value="reports"
          className="flex flex-col gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]"
        >
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>5 reports are ready to export.</CardDescription>
            </CardHeader>
        </TabsContent>
        <TabsContent
          value="settings"
          className="flex flex-col gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]"
        >
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and options. Customize your
                experience to fit your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Configure notifications, security, and themes.
            </CardContent>
        </TabsContent>
      </TabsContents>
    </Tabs>
  )
}
