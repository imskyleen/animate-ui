<script setup lang="ts">
import type { TabsOrientation } from '@animate-ui/vue/primitives/tabs'
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/vue/primitives/tabs'

defineProps<{ label: string, orientation?: TabsOrientation, dir?: 'rtl' }>()

const TABS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two', disabled: true },
  { value: 'three', label: 'Three' },
  { value: 'four', label: 'Four' },
]
</script>

<template>
  <Tabs :orientation="orientation" :dir="dir" class="w-80">
    <TabsHighlight class="absolute inset-0 z-0 rounded-md bg-accent">
      <TabsList
        :aria-label="label"
        :class="orientation === 'vertical' ? 'flex flex-col' : 'flex gap-1'"
      >
        <TabsHighlightItem v-for="tab in TABS" :key="tab.value" :value="tab.value">
          <TabsTrigger :value="tab.value" :disabled="tab.disabled" class="h-8 px-3 text-sm">
            {{ tab.label }}
          </TabsTrigger>
        </TabsHighlightItem>
      </TabsList>
    </TabsHighlight>
    <TabsContents class="mt-2">
      <TabsContent v-for="tab in TABS" :key="tab.value" :value="tab.value" class="p-2">
        {{ label }} {{ tab.label }} panel
      </TabsContent>
    </TabsContents>
  </Tabs>
</template>
