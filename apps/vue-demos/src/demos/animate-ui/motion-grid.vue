<script setup lang="ts">
import type { Frames } from '@animate-ui/vue/primitives/motion-grid'
import { MotionGrid, MotionGridCells } from '@animate-ui/vue/primitives/motion-grid'
import { RotatingText, RotatingTextContainer } from '@animate-ui/vue/primitives/texts/rotating'
import { motion } from 'motion-v'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const importingFrames = [
  [[2, 2]],
  [[1, 2], [2, 1], [2, 3], [3, 2]],
  [[2, 2], [0, 2], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 2]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 2], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [1, 0], [3, 0], [4, 1], [0, 3], [1, 4], [3, 4], [4, 3]],
  [[0, 0], [0, 4], [4, 0], [4, 4]],
  [],
] as Frames

const arrowDownFrames = [
  [[2, 0]],
  [[1, 0], [2, 0], [3, 0], [2, 1]],
  [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[2, 0], [2, 1], [1, 2], [2, 2], [3, 2], [2, 3]],
  [[2, 1], [2, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[2, 2], [2, 3], [1, 4], [2, 4], [3, 4]],
  [[2, 3], [2, 4]],
  [[2, 4]],
  [],
] as Frames

const arrowUpFrames = [
  [[2, 4]],
  [[1, 4], [2, 4], [3, 4], [2, 3]],
  [[2, 4], [1, 3], [2, 3], [3, 3], [2, 2]],
  [[2, 4], [2, 3], [1, 2], [2, 2], [3, 2], [2, 1]],
  [[2, 3], [2, 2], [1, 1], [2, 1], [3, 1], [2, 0]],
  [[2, 2], [2, 1], [1, 0], [2, 0], [3, 0]],
  [[2, 1], [2, 0]],
  [[2, 0]],
  [],
] as Frames

const syncingFrames = [...arrowDownFrames, ...arrowUpFrames] as Frames

const searchingFrames = [
  [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[3, 0], [2, 1], [3, 1], [4, 1], [3, 2]],
  [[3, 1], [2, 2], [3, 2], [4, 2], [3, 3]],
  [[3, 2], [2, 3], [3, 3], [4, 3], [3, 4]],
  [[1, 2], [0, 3], [1, 3], [2, 3], [1, 4]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
  [],
] as Frames

const busyFrames = [
  [[0, 1], [0, 2], [0, 3], [1, 2], [4, 1], [4, 2], [4, 3]],
  [[0, 1], [0, 2], [0, 3], [2, 3], [4, 2], [4, 3], [4, 4]],
  [[0, 1], [0, 2], [0, 3], [3, 4], [4, 2], [4, 3], [4, 4]],
  [[0, 1], [0, 2], [0, 3], [2, 3], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [2, 1], [4, 1], [4, 2], [4, 3]],
  [[0, 0], [0, 1], [0, 2], [3, 0], [4, 0], [4, 1], [4, 2]],
  [[0, 1], [0, 2], [0, 3], [2, 1], [4, 0], [4, 1], [4, 2]],
] as Frames

const savingFrames = [
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [2, 3], [3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [4, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [4, 0], [4, 1], [4, 2], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [3, 0], [4, 0], [4, 1], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [2, 0], [4, 0], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
] as Frames

const initializingFrames = [
  [],
  [[1, 0], [3, 0]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2]],
  [[2, 2]],
  [],
] as Frames

const states = {
  importing: {
    frames: importingFrames,
    label: 'Importing',
  },
  syncing: {
    frames: syncingFrames,
    label: 'Syncing',
  },
  searching: {
    frames: searchingFrames,
    label: 'Searching',
  },
  busy: {
    frames: busyFrames,
    label: 'Busy',
  },
  saving: {
    frames: savingFrames,
    label: 'Saving',
  },
  initializing: {
    frames: initializingFrames,
    label: 'Initializing',
  },
}

type State = keyof typeof states

const ORDER = Object.keys(states) as State[]

const state = ref<State>('importing')
let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  interval = setInterval(() => {
    state.value = ORDER[(ORDER.indexOf(state.value) + 1) % ORDER.length]!
  }, 3000)
})
onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <motion.button
    type="button"
    layout
    :while-press="{ scale: 0.95 }"
    class="relative inline-flex h-11 items-center justify-center gap-x-3 rounded-lg bg-primary px-3 text-sm font-medium"
  >
    <motion.div layout="preserve-aspect">
      <MotionGrid
        :grid-size="[5, 5]"
        :frames="states[state].frames"
        class="w-fit gap-0.5"
      >
        <MotionGridCells class="aspect-square size-[3px] rounded-full bg-primary-foreground/20 data-[active=true]:bg-primary-foreground/80" />
      </MotionGrid>
    </motion.div>
    <RotatingTextContainer
      :text="states[state].label"
      class="absolute top-1/2 left-[46px] -translate-y-1/2"
    >
      <RotatingText
        layout="preserve-aspect"
        class="text-primary-foreground"
      />
    </RotatingTextContainer>
    <span class="invisible opacity-0" aria-hidden="true">
      {{ states[state].label }}
    </span>
  </motion.button>
</template>
