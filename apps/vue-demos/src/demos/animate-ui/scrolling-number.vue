<script setup lang="ts">
import type { ScrollingNumberDirection } from '@animate-ui/vue/primitives/texts/scrolling-number'
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  ScrollingNumber,
  ScrollingNumberContainer,
  ScrollingNumberHighlight,
  ScrollingNumberItems,
} from '@animate-ui/vue/primitives/texts/scrolling-number'
import { cn } from 'cn'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{ direction?: ScrollingNumberDirection, delay?: number | string }>(),
  { direction: 'btt', delay: 1000 },
)

const run = ref(0)
const isVertical = computed(() => props.direction === 'btt' || props.direction === 'ttb')
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <ScrollingNumberContainer
      :key="`${run}-${direction}-${delay}`"
      :direction="direction"
      :number="1000"
      :step="100"
      :items-size="isVertical ? 40 : 75"
      :class="cn('text-lg font-medium tabular-nums', isVertical ? 'w-18' : 'h-10')"
    >
      <ScrollingNumber :delay="Number(delay)">
        <ScrollingNumberItems class="text-muted-foreground flex items-center justify-center" />
      </ScrollingNumber>
      <ScrollingNumberHighlight class="bg-muted size-full rounded-md" />
    </ScrollingNumberContainer>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RefreshIcon" :stroke-width="2" data-icon="inline-start" />
      Replay
    </Button>
  </div>
</template>
