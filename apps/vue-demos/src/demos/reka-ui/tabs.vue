<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const analytics = [
  ['Page views', '+25%'],
  ['Visitors', '3,240'],
  ['Bounce rate', '41%'],
  ['Avg. session', '2m 14s'],
]
</script>

<template>
  <Tabs default-value="overview" class="w-[400px]">
    <TabsList>
      <TabsTrigger value="overview">
        Overview
      </TabsTrigger>
      <TabsTrigger value="analytics">
        Analytics
      </TabsTrigger>
      <TabsTrigger value="reports">
        Reports
      </TabsTrigger>
      <TabsTrigger value="settings">
        Settings
      </TabsTrigger>
    </TabsList>
    <TabsContent value="overview">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            View your key metrics and recent project activity. Track progress
            across all your active projects.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          You have 12 active projects and 3 pending tasks.
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="analytics">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Track performance and user engagement metrics. Monitor trends and
            identify growth opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-2 text-sm">
          <div v-for="[label, value] in analytics" :key="label" class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ label }}</span>
            <span class="font-medium tabular-nums">{{ value }}</span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="reports">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>5 reports are ready to export.</CardDescription>
        </CardHeader>
      </Card>
    </TabsContent>
    <TabsContent value="settings">
      <Card>
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
      </Card>
    </TabsContent>
  </Tabs>
</template>
