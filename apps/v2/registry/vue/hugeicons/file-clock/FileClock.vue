<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FileClockProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    face1: {},
    face2: {},
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FileClock', inheritAttrs: false })
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
      <motion.circle
        :cx="8"
        :cy="17"
        :r="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.face1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 2.50022V3.00043C14 5.83009 14 7.24492 14.8786 8.12398C15.7573 9.00304 17.1715 9.00304 20 9.00304H20.5M5 9.00304C5.00194 6.05815 5.0424 4.5367 5.88598 3.48998C6.06499 3.26787 6.26722 3.06554 6.48924 2.88646C7.58822 2 9.21075 2 12.4558 2C13.1613 2 13.5141 2 13.8371 2.11406C13.9043 2.13778 13.9702 2.16508 14.0345 2.19583C14.3435 2.3437 14.593 2.59325 15.0918 3.09236L19.8284 7.83096C20.4065 8.40927 20.6955 8.69843 20.8478 9.06613C21 9.43383 21 9.84276 21 10.6606V14.0052C21 17.7781 21 19.6645 19.8284 20.8366C18.8853 21.7801 17.4795 21.9641 15 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.face2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 15L8 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.minute"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.5 17.5L8 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.hour"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
