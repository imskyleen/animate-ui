<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RadioProps = IconProps<keyof typeof animations>;

const waves = (
  wave: (ring: number, side: number) => Variants,
): Record<string, Variants> =>
  Object.fromEntries(
    [1, 2, 3, 4].map((i) => [`path${i}`, wave((i - 1) % 2, i <= 2 ? 1 : -1)]),
  );

export const animations = {
  default: {
    ...waves((ring, side) => ({
      initial: { opacity: 1, x: 0 },
      animate: {
        opacity: [1, 0.4, 1],
        x: [0, side * 0.8, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          delay: 0.1 + 0.15 * ring,
        },
      },
    })),
    circle: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.15, 0.96, 1.06, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: waves((ring) => ({
    initial: { opacity: 1, scale: 1 },
    animate: {
      opacity: [1, 0.25, 1],
      scale: [1, 0.85, 1],
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 * ring },
    },
  })) satisfies Record<string, Variants>,
  blink: waves((ring) => ({
    initial: { opacity: 1, scale: 1 },
    animate: {
      opacity: 0,
      scale: 0,
      transition: {
        opacity: {
          duration: 0.2,
          ease: 'easeInOut',
          repeat: 1,
          repeatType: 'reverse',
          repeatDelay: 0.2,
          delay: 0.2 * ring,
        },
        scale: {
          duration: 0.2,
          ease: 'easeInOut',
          repeat: 1,
          repeatType: 'reverse',
          repeatDelay: 0.2,
          delay: 0.2 * ring,
        },
      },
    },
  })) satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Radio', inheritAttrs: false })
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
      <motion.path
        d="M16.247 7.761a6 6 0 0 1 0 8.478"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M19.075 4.933a10 10 0 0 1 0 14.134"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7.753 16.239a6 6 0 0 1 0-8.478"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4.925 19.067a10 10 0 0 1 0-14.134"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
