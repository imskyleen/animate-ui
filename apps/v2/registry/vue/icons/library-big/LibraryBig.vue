<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LibraryBigProps = IconProps<keyof typeof animations>;

const PIVOT = '17.6px 20.96px';

export const animations = {
  default: {
    standing: {},
    spine: {},
    leaning: {
      initial: {
        rotate: 0,
        transformOrigin: PIVOT,
        transition: { duration: 0.15 },
      },
      animate: {
        rotate: [0, 20, 20, 0, 2, 0],
        transformOrigin: PIVOT,
        transition: {
          duration: 1,
          times: [0, 0.3, 0.5, 0.78, 0.88, 1],
          ease: ['easeOut', 'linear', 'easeIn', 'easeOut', 'easeInOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LibraryBig', inheritAttrs: false })
</script>

<template>
  <IconWrapper
    v-slot="{ variants, controls, size, attrs }"
    :animations="animations"
    v-bind="$attrs"
  >
    <motion.svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      :stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      v-bind="attrs"
    >
      <motion.rect
        width="8"
        height="18"
        x="3"
        y="3"
        rx="1"
        :variants="variants.standing"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 3v18"
        :variants="variants.spine"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"
        :variants="variants.leaning"
        initial="initial"
        :animate="controls"
        :style="{ transformBox: 'view-box' }"
      />
    </motion.svg>
  </IconWrapper>
</template>
