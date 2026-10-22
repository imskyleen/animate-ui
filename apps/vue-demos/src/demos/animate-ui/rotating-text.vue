<script setup lang="ts">
import { RotatingText, RotatingTextContainer } from '@animate-ui/vue/primitives/texts/rotating'

withDefaults(
  defineProps<{
    delay?: number | string
    y?: number | string
    duration?: number | string
    align?: 'none' | 'start' | 'center' | 'end'
  }>(),
  { delay: 0, y: -50, duration: 2000, align: 'none' },
)
</script>

<template>
  <RotatingTextContainer
    class="text-4xl font-semibold"
    :text="['Rotating', 'Text', 'Demo']"
    :delay="Number(delay)"
    :y="Number(y)"
    :duration="Number(duration)"
    :align="align === 'none' ? undefined : align"
  >
    <RotatingText />
  </RotatingTextContainer>
</template>
