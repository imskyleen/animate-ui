<script setup lang="ts">
import type { ParticlesEffectProps } from '@animate-ui/vue/primitives/effects/particles'
import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Particles, ParticlesEffect } from '@animate-ui/vue/primitives/effects/particles'
import { useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ParticlesLabel from './particles-label.vue'

const props = defineProps<{
  side?: ParticlesEffectProps['side']
  sideOffset?: number | string
  align?: ParticlesEffectProps['align']
  alignOffset?: number | string
  count?: number | string
  radius?: number | string
  spread?: number | string
  duration?: number | string
  holdDelay?: number | string
  delay?: number | string
}>()

const effect = computed(() => {
  const numeric = ['sideOffset', 'alignOffset', 'count', 'radius', 'spread', 'duration', 'holdDelay', 'delay'] as const
  const out: Record<string, unknown> = {}
  if (props.side) out.side = props.side
  if (props.align) out.align = props.align
  for (const key of numeric) if (props[key] !== undefined) out[key] = Number(props[key])
  return out
})

const liked = ref(false)
const burst = ref(0)
const reduce = useShouldReduceMotion()
</script>

<template>
  <Particles :animate="liked">
    <Button
      variant="outline"
      :aria-pressed="liked"
      :aria-label="liked ? 'Liked' : 'Like'"
      @click="liked = !liked; burst++"
    >
      <motion.span
        class="inline-flex"
        :initial="false"
        :animate="{ scale: reduce ? 1 : liked ? [1, 1.3, 1] : [1, 0.85, 1] }"
        :transition="{ duration: 0.4, times: [0, 0.4, 1], ease: ['easeOut', [0.34, 1.56, 0.64, 1]] }"
      >
        <HugeiconsIcon
          :icon="FavouriteIcon"
          :stroke-width="2"
          :class="cn('fill-transparent transition-[fill,color] duration-200 ease-out', liked && 'fill-red-500 text-red-500')"
        />
      </motion.span>
      <ParticlesLabel :text="liked ? 'Liked' : 'Like'" />
    </Button>
    <ParticlesEffect :key="burst" v-bind="effect" class="size-1 rounded-full bg-red-500" />
  </Particles>
</template>
