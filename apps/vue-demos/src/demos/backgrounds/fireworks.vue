<script setup lang="ts">
import FireworksBackground from '../../../../v2/registry/vue/backgrounds/fireworks/FireworksBackground.vue'
import { useDark } from '@/lib/use-dark'

withDefaults(defineProps<{ population?: number | string }>(), { population: 1 })

const dark = useDark()
</script>

<template>
  <FireworksBackground
    class="absolute inset-0"
    :color="dark ? 'white' : 'black'"
    :population="Number(population)"
  />
</template>
