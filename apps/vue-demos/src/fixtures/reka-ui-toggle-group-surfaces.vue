<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Layout = {
  variant: 'default' | 'outline'
  spacing: number
  orientation: 'horizontal' | 'vertical'
  single: boolean
  dir?: 'rtl'
  id: string
}

const lib = 'vue-reka-ui'
const items = ['bold', 'italic', 'underline', 'strike']
const layouts: Layout[] = []
for (const variant of ['outline', 'default'] as const)
  for (const spacing of [0, 2])
    for (const orientation of ['horizontal', 'vertical'] as const)
      layouts.push({ variant, spacing, orientation, single: false, id: `${lib}-${variant}-${spacing}-${orientation}` })
for (const variant of ['outline', 'default'] as const)
  layouts.push({ variant, spacing: 0, orientation: 'horizontal', single: false, dir: 'rtl', id: `${lib}-${variant}-0-horizontal-rtl` })
for (const variant of ['outline', 'default'] as const)
  for (const spacing of [0, 2])
    layouts.push({ variant, spacing, orientation: 'horizontal', single: true, id: `${lib}-${variant}-${spacing}-horizontal-single` })
</script>

<template>
  <section class="flex flex-wrap items-start gap-6">
    <div v-for="layout in layouts" :key="layout.id" :dir="layout.dir">
      <ToggleGroup
        :type="layout.single ? 'single' : 'multiple'"
        :variant="layout.variant"
        :spacing="layout.spacing"
        :orientation="layout.orientation"
        :dir="layout.dir"
        :data-testid="layout.id"
        :class="layout.orientation === 'vertical' ? 'flex-col items-stretch' : undefined"
      >
        <ToggleGroupItem
          v-for="value in items"
          :key="value"
          :value="value"
          :aria-label="value"
        >
          {{ value[0]!.toUpperCase() }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  </section>
</template>
