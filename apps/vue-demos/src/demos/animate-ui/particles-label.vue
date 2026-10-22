<script setup lang="ts">
import { useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { AnimatePresence, motion } from 'motion-v'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

defineProps<{ text: string }>()

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const reduce = useShouldReduceMotion()
const inner = shallowRef<HTMLElement | null>(null)
const width = ref<number | 'auto'>('auto')
let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    width.value = entry!.borderBoxSize[0]!.inlineSize
  })
  if (inner.value) observer.observe(inner.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <motion.span
    aria-hidden="true"
    class="relative inline-flex"
    :initial="false"
    :animate="{ width }"
    :transition="reduce ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT }"
  >
    <span ref="inner" class="inline-flex">
      <AnimatePresence mode="popLayout" :initial="false">
        <motion.span
          :key="text"
          :initial="reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(2px)' }"
          :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
          :exit="reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(2px)' }"
          :transition="{ duration: 0.2, ease: EASE_OUT }"
        >
          {{ text }}
        </motion.span>
      </AnimatePresence>
    </span>
  </motion.span>
</template>
