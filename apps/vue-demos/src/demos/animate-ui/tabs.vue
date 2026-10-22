<script setup lang="ts">
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/vue/primitives/tabs'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'reports', label: 'Reports' },
  { value: 'settings', label: 'Settings' },
]

const STATS = [
  ['Page views', '+25%'],
  ['Visitors', '3,240'],
  ['Bounce rate', '41%'],
  ['Avg. session', '2m 14s'],
]

const CONTENT = 'flex flex-col gap-(--card-spacing) py-(--card-spacing) [--card-spacing:--spacing(4)]'
</script>

<template>
  <Tabs default-value="overview" class="w-[400px]">
    <TabsHighlight class="absolute inset-0 z-0 rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
      <TabsList class="inline-flex h-8 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
        <TabsHighlightItem v-for="tab in TABS" :key="tab.value" :value="tab.value">
          <TabsTrigger
            :value="tab.value"
            class="inline-flex h-full items-center justify-center rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-500 ease-in-out hover:text-foreground data-[state=active]:text-foreground dark:text-muted-foreground dark:data-[state=active]:text-foreground"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsHighlightItem>
      </TabsList>
    </TabsHighlight>
    <TabsContents class="mt-2 rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10">
      <TabsContent value="overview" :class="CONTENT">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            View your key metrics and recent project activity. Track
            progress across all your active projects.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          You have 12 active projects and 3 pending tasks.
        </CardContent>
      </TabsContent>
      <TabsContent value="analytics" :class="CONTENT">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Track performance and user engagement metrics. Monitor trends
            and identify growth opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-2 text-sm">
          <div v-for="[label, value] in STATS" :key="label" class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ label }}</span>
            <span class="font-medium tabular-nums">{{ value }}</span>
          </div>
        </CardContent>
      </TabsContent>
      <TabsContent value="reports" :class="CONTENT">
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>5 reports are ready to export.</CardDescription>
        </CardHeader>
      </TabsContent>
      <TabsContent value="settings" :class="CONTENT">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and options. Customize your
            experience to fit your needs.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          Configure notifications, security, and themes.
        </CardContent>
      </TabsContent>
    </TabsContents>
  </Tabs>
</template>
