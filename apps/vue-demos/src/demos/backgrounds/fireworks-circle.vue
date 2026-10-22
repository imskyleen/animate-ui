<script setup lang="ts">
import FireworksBackground from '../../../../v2/registry/vue/backgrounds/fireworks/FireworksBackground.vue'
import { useDark } from '@/lib/use-dark'

withDefaults(
  defineProps<{
    population?: number | string
    fireworkSize?: number | string
    fireworkSpeed?: number | string
    particleSize?: number | string
    particleSpeed?: number | string
  }>(),
  { population: 1, fireworkSize: 7, fireworkSpeed: 7, particleSize: 7, particleSpeed: 7 },
)

const dark = useDark()
</script>

<template>
  <FireworksBackground
    class="absolute inset-0"
    :color="dark ? 'white' : 'black'"
    :population="Number(population)"
    :firework-size="Number(fireworkSize)"
    :firework-speed="Number(fireworkSpeed)"
    :particle-size="Number(particleSize)"
    :particle-speed="Number(particleSpeed)"
  />
</template>
