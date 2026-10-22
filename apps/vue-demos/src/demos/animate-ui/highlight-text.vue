<script setup lang="ts">
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { HighlightText } from '@animate-ui/vue/primitives/texts/highlight'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <HighlightText
      :key="`${run}-${delay}`"
      :delay="Number(delay)"
      class="rounded-md bg-linear-to-r from-blue-100 to-purple-100 px-1 text-4xl font-semibold dark:from-blue-500 dark:to-purple-500"
      text="Highlight Text"
    />
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RefreshIcon" :stroke-width="2" data-icon="inline-start" />
      Replay
    </Button>
  </div>
</template>
