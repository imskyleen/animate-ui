<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiDisconnected03Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    waves: {},
    x1: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 45, 0],
        scale: [1, 0.85, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    x2: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 45, 0],
        scale: [1, 0.85, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.05 },
      },
    },
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiDisconnected03', inheritAttrs: false })
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
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M2 7.81966C4.75011 5.35989 8.31034 4 12 4M5 11.8587C6.86929 10.0264 9.38247 9.00009 12 9.00009M8.5 15.4287C9.43464 14.5125 10.6912 13.9994 12 13.9994C13.3088 13.9994 14.5654 14.5125 15.5 15.4287M12.1256 18.75H12.0006M12.2506 18.75C12.2506 18.8881 12.1387 19 12.0006 19C11.8625 19 11.7506 18.8881 11.7506 18.75C11.7506 18.6119 11.8625 18.5 12.0006 18.5C12.1387 18.5 12.2506 18.6119 12.2506 18.75Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.waves"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M16 4L22 10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.x1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 4L16 10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.x2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
