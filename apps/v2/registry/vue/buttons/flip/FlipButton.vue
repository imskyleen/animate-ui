<script setup lang="ts">
import type { Transition } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import type { FlipDirection } from './context'
import { Slot } from '@animate-ui/vue/primitives/slot'
import { motionTokens, ReducedMotionConfig, useShouldReduceMotion, useTempoTransition } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed, provide } from 'vue'
import { FlipButtonKey } from './context'

const props = withDefaults(
  defineProps<{
    from?: FlipDirection
    tapScale?: number
    asChild?: boolean
    transition?: Transition
    class?: HTMLAttributes['class']
  }>(),
  { from: 'top', tapScale: motionTokens.scale.press, asChild: false },
)

const reduce = useShouldReduceMotion()
const defaultTransition = useTempoTransition(() => motionTokens.spring.press)
const isVertical = computed(() => props.from === 'top' || props.from === 'bottom')

provide(FlipButtonKey, {
  from: () => props.from,
  isVertical: () => isVertical.value,
  rotateAxis: () => (isVertical.value ? 'rotateX' : 'rotateY'),
})
</script>

<template>
  <ReducedMotionConfig>
    <component
      :is="props.asChild ? Slot : motion.button"
      data-slot="flip-button"
      :class="cn('text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg', props.class)"
      :variants="reduce ? undefined : { initial: { transform: 'scale(1)' } }"
      initial="initial"
      while-hover="hover"
      :while-press="reduce ? undefined : { transform: `scale(${props.tapScale})` }"
      :transition="props.transition ?? defaultTransition"
      :style="{ display: 'inline-grid', placeItems: 'center', perspective: '1000px' }"
    >
      <slot />
    </component>
  </ReducedMotionConfig>
</template>
