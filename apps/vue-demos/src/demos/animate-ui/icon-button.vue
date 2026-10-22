<script setup lang="ts">
import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { IconButton, IconButtonParticles } from '@animate-ui/vue/primitives/buttons/icon'
import { useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { ref } from 'vue'

const iconButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline:
          'bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
      },
      size: {
        default: 'size-9',
        sm: 'size-8',
        lg: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type IconButtonVariants = VariantProps<typeof iconButtonVariants>

withDefaults(
  defineProps<{
    variant?: IconButtonVariants['variant']
    size?: IconButtonVariants['size']
  }>(),
  { variant: 'outline', size: 'default' },
)

const liked = ref(false)
const reduce = useShouldReduceMotion()
</script>

<template>
  <IconButton
    aria-label="Like"
    :aria-pressed="liked"
    :class="cn(iconButtonVariants({ variant, size }))"
    @click="liked = !liked"
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
    <IconButtonParticles v-if="liked" class="text-red-500" />
  </IconButton>
</template>
