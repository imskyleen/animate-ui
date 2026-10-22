<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ArchiveProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lid: {
      initial: {
        y: 0,
        rotate: 0,
        transformOrigin: '2px 5.5px',
        transition: { duration: 0.15 },
      },
      animate: {
        y: [0, -1, 0],
        rotate: [0, -2, 0],
        transformOrigin: '2px 5.5px',
        transition: { duration: 0.5, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
    body: {},
    handle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Archive', inheritAttrs: false })
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
        width="20"
        height="5"
        x="2"
        y="3"
        rx="1"
        :variants="variants.lid"
        initial="initial"
        :animate="controls"
        :style="{ transformBox: 'view-box' }"
      />
      <motion.path
        d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
        :variants="variants.body"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M10 12h4"
        :variants="variants.handle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
