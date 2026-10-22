<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CalendarDaysProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    day1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.1, 0.18], ease: 'easeOut' },
      },
    },
    day2: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.22, 0.3], ease: 'easeOut' },
      },
    },
    day3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.34, 0.42], ease: 'easeOut' },
      },
    },
    day4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.46, 0.54], ease: 'easeOut' },
      },
    },
    day5: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.58, 0.66], ease: 'easeOut' },
      },
    },
    day6: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 0, 1],
        transition: { duration: 1, times: [0, 0.7, 0.78], ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CalendarDays', inheritAttrs: false })
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
      <path
        d="M8 2v3"
      />
      <path
        d="M16 2v3"
      />
      <rect
        :x="3"
        :y="3"
        :width="18"
        :height="18"
        :rx="2"
      />
      <path
        d="M3 9h18"
      />
      <motion.path
        d="M8 13h.01"
        :variants="variants.day1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 13h.01"
        :variants="variants.day2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 13h.01"
        :variants="variants.day3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 17h.01"
        :variants="variants.day4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 17h.01"
        :variants="variants.day5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 17h.01"
        :variants="variants.day6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
