<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoonProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path: {
      initial: { rotate: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
      animate: {
        rotate: [0, -15, 8, -3, 0],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  spin: {
    path: {
      initial: {
        rotate: 0,
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
        },
      },
      animate: {
        rotate: [0, -30, 400, 360],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.75, 1],
          ease: ['easeInOut', 'easeInOut', 'easeInOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  balancing: {
    path: {
      initial: {
        rotate: 0,
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
        },
      },
      animate: {
        rotate: [0, -30, 25, -15, 10, -5, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Moon', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
