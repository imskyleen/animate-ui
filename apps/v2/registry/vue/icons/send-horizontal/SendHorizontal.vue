<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SendHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        x: 0,
      },
      animate: {
        scale: [1, 0.8, 1, 1, 1],
        x: [0, '-10%', '125%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 1.2 },
          x: {
            ease: 'easeInOut',
            duration: 1.2,
            times: [0, 0.25, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SendHorizontal', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M3.7,3c-.2-.1-.5,0-.7.2,0,.1,0,.3,0,.4l2.8,7.6c.2.5.2.9,0,1.4l-2.8,7.6c0,.3,0,.5.3.6.1,0,.3,0,.4,0l18-8.5c.2-.1.4-.4.2-.7,0-.1-.1-.2-.2-.2L3.7,3Z"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M6,12h16"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
