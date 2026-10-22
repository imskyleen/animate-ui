<script setup lang="ts">
import type { Transition } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { Slot } from '@animate-ui/vue/primitives/slot'
import { motionTokens, ReducedMotionConfig, useShouldReduceMotion, useTempoTransition } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    delay?: string
    fillHeight?: string
    hoverScale?: number
    tapScale?: number
    asChild?: boolean
    transition?: Transition
    class?: HTMLAttributes['class']
  }>(),
  { delay: '0.3s', fillHeight: '3px', hoverScale: 1, tapScale: motionTokens.scale.press, asChild: false },
)

const HOVER_TRANSITION = {
  transform: { duration: 0.3, ease: 'easeOut' },
  '--liquid-button-fill-width': { duration: 0 },
  '--liquid-button-fill-height': { duration: 0 },
  '--liquid-button-delay': { duration: 0 },
} as Transition

const DEFAULT_TRANSITION = {
  transform: motionTokens.spring.press,
  default: { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] },
} as Transition

const reduce = useShouldReduceMotion()
const hoverTransition = useTempoTransition(() => HOVER_TRANSITION)
const defaultTransition = useTempoTransition(() => DEFAULT_TRANSITION)

const whileHover = computed(() => ({
  ...(reduce.value || props.hoverScale === 1 ? null : { transform: `scale(${props.hoverScale})` }),
  '--liquid-button-fill-width': '100%',
  '--liquid-button-fill-height': '100%',
  '--liquid-button-delay': props.delay,
  transition: hoverTransition.value,
}))

const style = computed(() => ({
  '--liquid-button-fill-width': '-1%',
  '--liquid-button-fill-height': props.fillHeight,
  '--liquid-button-delay': '0s',
  'background': 'linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
  'backgroundColor': 'var(--liquid-button-background-color)',
  'transition': `background ${props.delay} var(--liquid-button-delay, 0s), color ${props.delay} ${props.delay}, background-position ${props.delay} calc(${props.delay} - var(--liquid-button-delay, 0s))`,
}))
</script>

<template>
  <ReducedMotionConfig>
    <component
      :is="props.asChild ? Slot : motion.button"
      :initial="reduce ? undefined : { transform: 'scale(1)' }"
      :while-press="reduce ? undefined : { transform: `scale(${props.tapScale})` }"
      :while-hover="whileHover"
      :transition="props.transition ?? defaultTransition"
      data-slot="liquid-button"
      :class="cn(
        'inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-medium whitespace-nowrap text-primary outline-none [--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)] hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        props.class,
      )"
      :style="style"
    >
      <slot />
    </component>
  </ReducedMotionConfig>
</template>
