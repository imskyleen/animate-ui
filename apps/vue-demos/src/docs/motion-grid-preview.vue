<script setup lang="ts">
import type { Frames } from '@animate-ui/vue/primitives/motion-grid'
import { MotionGrid, MotionGridCells } from '@animate-ui/vue/primitives/motion-grid'

withDefaults(
  defineProps<{
    gridSize: [number, number]
    frames: Frames
    duration?: number
    animate?: boolean
    radius?: string
    gridClass?: string
  }>(),
  { duration: 200, animate: true, radius: '100%', gridClass: '' },
)
</script>

<template>
  <MotionGrid
    :grid-size="gridSize"
    :frames="frames"
    :duration="duration"
    :animate="animate"
    :class="gridClass"
  >
    <MotionGridCells
      :style="{ borderRadius: radius }"
      class="aspect-square size-full bg-foreground/15 data-[active=true]:bg-foreground"
    />
  </MotionGrid>
</template>
