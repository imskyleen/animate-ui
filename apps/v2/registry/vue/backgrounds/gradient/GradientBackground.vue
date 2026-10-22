<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { Transition } from 'motion-v'
import { ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { usePageVisible } from '@animate-ui/vue/utils/use-page-visible'
import { cn } from 'cn'
import { motion, useInView } from 'motion-v'
import { computed, shallowRef } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{ class?: HTMLAttributes['class'], transition?: Transition }>(),
  { transition: () => ({ duration: 15, ease: 'easeInOut', repeat: Infinity }) },
)

const STATIC_POSITION = '0% 50%'

const element = shallowRef<HTMLElement | null>(null)
const inView = useInView(element)
const pageVisible = usePageVisible()
const reduce = useShouldReduceMotion()
const playing = computed(() => inView.value && pageVisible.value && !reduce.value)

const setElement = (node: unknown) => {
  const el = (node as { $el?: unknown } | null)?.$el ?? node
  element.value = el instanceof HTMLElement ? el : null
}
</script>

<template>
  <ReducedMotionConfig>
    <motion.div
      :ref="setElement"
      data-slot="gradient-background"
      :class="cn('size-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-[length:400%_400%]', props.class)"
      :animate="{ backgroundPosition: playing ? [STATIC_POSITION, '100% 50%', STATIC_POSITION] : STATIC_POSITION }"
      :transition="playing ? transition : { duration: 0 }"
      v-bind="$attrs"
    >
      <slot />
    </motion.div>
  </ReducedMotionConfig>
</template>
