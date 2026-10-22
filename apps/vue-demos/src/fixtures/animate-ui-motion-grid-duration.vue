<script setup lang="ts">
import { MotionGrid, MotionGridCells } from '@animate-ui/vue/primitives/motion-grid'
</script>

<template>
  <MotionGrid
    :grid-size="[2, 1]"
    :frames="[[[0, 0]]]"
    :duration="200"
    :animate="false"
    :style="{ width: '80px', height: '40px' }"
  >
    <MotionGridCells
      class="bg-black"
      :active-props="{ animate: { opacity: 1 } }"
      :inactive-props="{ animate: { opacity: 0.2 } }"
    />
  </MotionGrid>
</template>
