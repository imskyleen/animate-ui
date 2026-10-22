<script setup lang="ts">
import { Highlight } from '@animate-ui/vue/primitives/effects/highlight'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    mode?: 'children' | 'parent'
    exitDelay?: number | string
    hover?: boolean | string
  }>(),
  { mode: 'children', exitDelay: 200, hover: false },
)

const TABS = [
  { value: 'overview', title: 'Overview' },
  { value: 'activity', title: 'Activity' },
  { value: 'settings', title: 'Settings' },
]

const shared = computed(() => ({
  exitDelay: Number(props.exitDelay),
  hover: props.hover === true || props.hover === 'true',
  defaultValue: TABS[0]?.value,
  class: 'inset-0 rounded-full bg-accent',
}))
</script>

<template>
  <div class="flex rounded-full border p-1">
    <Highlight
      :key="mode"
      :mode="mode"
      :container-class-name="mode === 'parent' ? 'flex' : undefined"
      v-bind="shared"
    >
      <button
        v-for="tab in TABS"
        :key="tab.value"
        type="button"
        :data-value="tab.value"
        class="flex h-8 items-center justify-center rounded-full px-4 text-sm text-muted-foreground transition-all duration-300 data-[active=true]:font-medium data-[active=true]:text-foreground"
      >
        {{ tab.title }}
      </button>
    </Highlight>
  </div>
</template>
