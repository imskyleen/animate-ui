<script setup lang="ts">
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

withDefaults(
  defineProps<{
    multiple?: boolean
    variant?: 'default' | 'outline'
    size?: 'default' | 'sm' | 'lg'
    spacing?: number
  }>(),
  { multiple: true, variant: 'outline', size: 'default', spacing: 0 },
)
</script>

<template>
  <ToggleGroup
    :key="`${multiple}-${variant}-${size}-${spacing}`"
    :variant="variant"
    :size="size"
    :spacing="Number(spacing)"
    :type="multiple ? 'multiple' : 'single'"
  >
    <ToggleGroupItem value="bold" aria-label="Toggle bold">
      <HugeiconsIcon :icon="TextBoldIcon" :stroke-width="2" class="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="italic" aria-label="Toggle italic">
      <HugeiconsIcon :icon="TextItalicIcon" :stroke-width="2" class="h-4 w-4" />
    </ToggleGroupItem>
    <ToggleGroupItem value="underline" aria-label="Toggle underline">
      <HugeiconsIcon :icon="TextUnderlineIcon" :stroke-width="2" class="h-4 w-4" />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
