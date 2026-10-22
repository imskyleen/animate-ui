<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ContrastProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 180,
        transformOrigin: 'left center',
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transformOrigin: 'left center',
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Contrast', inheritAttrs: false })
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
        :cx="12"
        :cy="12"
        :r="10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M12 22V2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.5 17L12 17"
          stroke-linecap="round"
        />
        <path
          d="M22 12L12 12"
          stroke-linecap="round"
        />
        <path
          d="M20.5 7L12 7"
          stroke-linecap="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
