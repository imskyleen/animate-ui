<script setup lang="ts">
import type { SwappingTextDirection } from '@animate-ui/vue/primitives/texts/swapping'
import { SwappingText } from '@animate-ui/vue/primitives/texts/swapping'

withDefaults(
  defineProps<{
    direction?: SwappingTextDirection
    stagger?: number | string
    duration?: number | string
  }>(),
  { direction: 'up', stagger: 0.07, duration: 2000 },
)

const WORDS = ['Design', 'Develop', 'Deploy']
</script>

<template>
  <span class="inline-grid justify-items-start text-4xl font-semibold">
    <span
      v-for="word in WORDS"
      :key="word"
      aria-hidden="true"
      class="invisible col-start-1 row-start-1"
    >{{ word }}</span>
    <span class="col-start-1 row-start-1 w-0 whitespace-nowrap">
      <SwappingText
        :text="WORDS"
        :direction="direction"
        :stagger="Number(stagger)"
        :duration="Number(duration)"
      />
    </span>
  </span>
</template>
