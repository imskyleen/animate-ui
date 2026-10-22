<script setup lang="ts">
import type { SlidingTextDirection, SlidingTextTrigger } from '@animate-ui/vue/primitives/texts/sliding'
import { SlidingText } from '@animate-ui/vue/primitives/texts/sliding'

withDefaults(
  defineProps<{ direction?: SlidingTextDirection, trigger?: SlidingTextTrigger }>(),
  { direction: 'down', trigger: 'hover' },
)
</script>

<template>
  <SlidingText
    :key="`${direction}-${trigger}`"
    :direction="direction"
    :trigger="trigger"
    class="cursor-pointer text-4xl font-semibold"
    text="Sliding Text"
  />
</template>
