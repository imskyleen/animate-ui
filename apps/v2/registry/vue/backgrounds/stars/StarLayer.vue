<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { Transition } from 'motion-v'
import { ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { usePageVisible } from '@animate-ui/vue/utils/use-page-visible'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed, inject, onMounted, shallowRef, watch } from 'vue'
import { StarsInViewKey } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    count?: number
    size?: number
    transition?: Transition
    starColor?: string
  }>(),
  {
    count: 1000,
    size: 1,
    transition: () => ({ repeat: Infinity, duration: 50, ease: 'linear' }),
    starColor: '#fff',
  },
)

function generateStars(count: number) {
  const shadows: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000
    const y = Math.floor(Math.random() * 4000) - 2000
    shadows.push(`${x}px ${y}px`)
  }
  return shadows.join(', ')
}

const first = shallowRef<HTMLElement | null>(null)
const second = shallowRef<HTMLElement | null>(null)

const inView = inject(StarsInViewKey, () => true)
const pageVisible = usePageVisible()
const reduce = useShouldReduceMotion()
const playing = computed(() => inView() && pageVisible.value && !reduce.value)

function paint() {
  if (!first.value || !second.value) return
  const boxShadow = generateStars(props.count)
  first.value.style.boxShadow = boxShadow
  second.value.style.boxShadow = boxShadow
}
onMounted(paint)
watch(() => props.count, paint, { flush: 'post' })
</script>

<template>
  <ReducedMotionConfig>
    <motion.div
      data-slot="star-layer"
      :initial="{ transform: 'translateY(0px)' }"
      :animate="{ transform: playing ? ['translateY(0px)', 'translateY(-2000px)'] : 'translateY(0px)' }"
      :transition="playing ? transition : { duration: 0 }"
      :class="cn('absolute top-0 left-0 w-full h-[2000px]', props.class)"
      v-bind="$attrs"
    >
      <div
        ref="first"
        class="absolute bg-transparent rounded-full"
        :style="{ width: `${size}px`, height: `${size}px`, color: starColor }"
      />
      <div
        ref="second"
        class="absolute bg-transparent rounded-full top-[2000px]"
        :style="{ width: `${size}px`, height: `${size}px`, color: starColor }"
      />
    </motion.div>
  </ReducedMotionConfig>
</template>
