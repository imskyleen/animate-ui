<script setup lang="ts">
import type { Transition } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { Slot } from '@animate-ui/vue/primitives/slot'
import { useShouldReduceMotion, useTempoTransition } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed, inject } from 'vue'
import { buildVariant, FACE_TRANSITION, FlipButtonKey } from './context'

const props = withDefaults(
  defineProps<{
    asChild?: boolean
    transition?: Transition
    class?: HTMLAttributes['class']
  }>(),
  { asChild: false },
)

const flip = inject(FlipButtonKey)!
const defaultTransition = useTempoTransition(() => FACE_TRANSITION)
const reduce = useShouldReduceMotion()

const variants = computed(() => {
  const from = flip.from()
  const offset = from === 'top' || from === 'left' ? '-50%' : '50%'
  const isVertical = flip.isVertical()
  const rotateAxis = flip.rotateAxis()
  return {
    initial: buildVariant({ opacity: 0, rotation: reduce.value ? 0 : 90, offset: reduce.value ? '0%' : offset, isVertical, rotateAxis }),
    hover: buildVariant({ opacity: 1, rotation: 0, offset: '0%', isVertical, rotateAxis }),
  }
})
</script>

<template>
  <component
    :is="props.asChild ? Slot : motion.span"
    data-slot="flip-button-back"
    :class="cn('h-10 rounded-lg bg-muted px-4 text-foreground', props.class)"
      aria-hidden="true"
    :variants="variants"
    :transition="props.transition ?? defaultTransition"
    :style="{ gridArea: '1 / 1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }"
  >
    <slot />
  </component>
</template>
