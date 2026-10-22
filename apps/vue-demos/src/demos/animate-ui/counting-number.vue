<script setup lang="ts">
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CountingNumber } from '@animate-ui/vue/primitives/texts/counting-number'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{
    number?: number | string
    fromNumber?: number | string
    padStart?: boolean | string
    decimalSeparator?: string
    decimalPlaces?: number | string
    delay?: number | string
  }>(),
  {
    number: 2025,
    fromNumber: 0,
    padStart: false,
    decimalSeparator: '.',
    decimalPlaces: 0,
    delay: 0,
  },
)

const run = ref(0)
const key = computed(() =>
  [run.value, props.number, props.fromNumber, props.padStart, props.decimalSeparator, props.decimalPlaces, props.delay].join(),
)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <CountingNumber
      :key="key"
      :number="Number(number)"
      :from-number="Number(fromNumber)"
      :pad-start="padStart === true || padStart === 'true'"
      :decimal-separator="decimalSeparator"
      :decimal-places="Number(decimalPlaces)"
      :delay="Number(delay)"
      class="text-4xl font-semibold tabular-nums"
    />
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RefreshIcon" :stroke-width="2" data-icon="inline-start" />
      Replay
    </Button>
  </div>
</template>
