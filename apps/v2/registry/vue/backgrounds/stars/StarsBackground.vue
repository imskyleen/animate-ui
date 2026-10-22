<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SpringOptions } from 'motion-v'
import { ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { motion, useInView, useMotionValue, useSpring } from 'motion-v'
import { provide, shallowRef, toRef } from 'vue'
import { StarsInViewKey } from './context'
import StarLayer from './StarLayer.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    factor?: number
    speed?: number
    transition?: SpringOptions
    starColor?: string
    pointerEvents?: boolean
  }>(),
  {
    factor: 0.05,
    speed: 50,
    transition: () => ({ stiffness: 50, damping: 20 }),
    starColor: '#fff',
    pointerEvents: true,
  },
)

const container = shallowRef<HTMLElement | null>(null)
const inView = useInView(container)
const reduce = useShouldReduceMotion()

const offsetX = useMotionValue(1)
const offsetY = useMotionValue(1)
const springX = useSpring(offsetX, toRef(props, 'transition'))
const springY = useSpring(offsetY, toRef(props, 'transition'))

provide(StarsInViewKey, () => inView.value)

function handleMouseMove(e: MouseEvent) {
  if (reduce.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  offsetX.set(-(e.clientX - centerX) * props.factor)
  offsetY.set(-(e.clientY - centerY) * props.factor)
}
</script>

<template>
  <ReducedMotionConfig>
    <div
      ref="container"
      data-slot="stars-background"
      :class="cn('relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]', props.class)"
      v-bind="$attrs"
      @mousemove="handleMouseMove"
    >
      <motion.div
        aria-hidden="true"
        :style="{ x: springX, y: springY }"
        :class="cn({ 'pointer-events-none': !pointerEvents })"
      >
        <StarLayer :count="1000" :size="1" :transition="{ repeat: Infinity, duration: speed, ease: 'linear' }" :star-color="starColor" />
        <StarLayer :count="400" :size="2" :transition="{ repeat: Infinity, duration: speed * 2, ease: 'linear' }" :star-color="starColor" />
        <StarLayer :count="200" :size="3" :transition="{ repeat: Infinity, duration: speed * 3, ease: 'linear' }" :star-color="starColor" />
      </motion.div>
      <slot />
    </div>
  </ReducedMotionConfig>
</template>
