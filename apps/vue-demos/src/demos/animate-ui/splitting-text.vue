<script setup lang="ts">
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { SplittingText } from '@animate-ui/vue/primitives/texts/splitting'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'

const ANIMATIONS = {
  default: {},
  vibe: {
    initial: { y: 50, scale: 0.5, opacity: 0, x: 50, rotate: 90 },
    animate: { y: 0, scale: 1, opacity: 1, x: 0, rotate: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  writing: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', bounce: 0, duration: 2 },
  },
} as const

const props = withDefaults(
  defineProps<{
    type?: 'chars' | 'words' | 'lines'
    delay?: number | string
    animation?: keyof typeof ANIMATIONS
  }>(),
  { type: 'chars', delay: 0, animation: 'default' },
)

const run = ref(0)
const animated = computed(() => ({
  delay: Number(props.delay),
  ...ANIMATIONS[props.animation],
}))
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <SplittingText
      v-if="type === 'lines'"
      :key="`${run}-${type}-${delay}-${animation}`"
      class="text-xl font-semibold"
      type="lines"
      :text="[
        'Introducing Splitting Text component',
        'Made with Motion. Highly customizable and easy to use.',
      ]"
      v-bind="animated"
    />
    <SplittingText
      v-else
      :key="`${run}-${type}-${delay}-${animation}`"
      class="text-4xl font-semibold"
      :type="type"
      text="Splitting Text"
      v-bind="animated"
    />
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RefreshIcon" :stroke-width="2" data-icon="inline-start" />
      Replay
    </Button>
  </div>
</template>
