<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GavelProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: { transformOrigin: 'bottom left', rotate: [0, 10, -4, 0] },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Gavel', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M14 2L7 9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M21 9L14 16"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.5 8L15 14.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.5 10L13 3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.5 11.5L2 21"
          stroke-linecap="round"
        />
      </motion.g>
      <path
        d="M22 22H11"
        stroke-linecap="round"
      />
      <path
        d="M20 21.5C20 20.5681 20 20.1022 19.8478 19.7346C19.6448 19.2446 19.2554 18.8552 18.7654 18.6522C18.3978 18.5 17.9319 18.5 17 18.5H16C15.0681 18.5 14.6022 18.5 14.2346 18.6522C13.7446 18.8552 13.3552 19.2446 13.1522 19.7346C13 20.1022 13 20.5681 13 21.5"
        stroke-linecap="round"
      />
    </motion.svg>
  </IconWrapper>
</template>
