<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SunsetProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sun: {
      initial: { scale: 1, transformOrigin: '50% 100%' },
      animate: {
        scale: [1, 0.4, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 100%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.5, ease: 'easeOut', times: [0, 0.5, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Sunset', inheritAttrs: false })
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
      <path
        d="M18.3633 10.6357L16.9491 12.05"
        stroke-linecap="round"
      />
      <path
        d="M3 17H5"
        stroke-linecap="round"
      />
      <path
        d="M5.63657 10.6356L7.05078 12.0498"
        stroke-linecap="round"
      />
      <path
        d="M21 17H19"
        stroke-linecap="round"
      />
      <path
        d="M21 20H3"
        stroke-linecap="round"
      />
      <motion.path
        d="M16 17C16 14.7909 14.2091 13 12 13C9.79086 13 8 14.7909 8 17"
        stroke-linecap="round"
        :variants="variants.sun"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 4V10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.shaft"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.head"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M9.5 7.5C9.99153 8.0057 11.2998 10 12 10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.5 7.5C14.0085 8.0057 12.7002 10 12 10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
