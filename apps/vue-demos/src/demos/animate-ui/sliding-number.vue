<script setup lang="ts">
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { SlidingNumber } from '@animate-ui/vue/primitives/texts/sliding-number'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    number?: number | string
    fromNumber?: boolean | string
    padStart?: boolean | string
    decimalSeparator?: string
    decimalPlaces?: number | string
    thousandSeparator?: string
    delay?: number | string
  }>(),
  {
    number: 2025,
    fromNumber: true,
    padStart: true,
    decimalSeparator: ',',
    decimalPlaces: 0,
    thousandSeparator: '.',
    delay: 0,
  },
)

const on = (value: boolean | string) => value === true || value === 'true'
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <SlidingNumber
      :key="`${run}-${delay}-${fromNumber}`"
      :number="Number(number)"
      :from-number="on(fromNumber) ? 0 : undefined"
      :pad-start="on(padStart)"
      :decimal-separator="decimalSeparator"
      :decimal-places="Number(decimalPlaces)"
      :thousand-separator="thousandSeparator"
      :delay="Number(delay)"
      class="text-4xl font-semibold"
    />
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RefreshIcon" :stroke-width="2" data-icon="inline-start" />
      Replay
    </Button>
  </div>
</template>
