<script setup lang="ts">
import TopographyBackground from '../../../../v2/registry/vue/backgrounds/topography/TopographyBackground.vue'

withDefaults(
  defineProps<{
    lineColor?: string
    levels?: number | string
    speed?: number | string
    scale?: number | string
    peak?: number | string
    interactive?: boolean | string
  }>(),
  { lineColor: '', levels: 16, speed: 1, scale: 1, peak: 1, interactive: true },
)
</script>

<template>
  <TopographyBackground
    class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#fafafa_0%,#f0f0f0_100%)] text-neutral-500 dark:bg-[radial-gradient(ellipse_at_center,#171717_0%,#000_100%)] dark:text-neutral-400"
    :line-color="lineColor || undefined"
    :levels="Number(levels)"
    :speed="Number(speed)"
    :scale="Number(scale)"
    :peak="Number(peak)"
    :interactive="interactive === true || interactive === 'true'"
  />
</template>
