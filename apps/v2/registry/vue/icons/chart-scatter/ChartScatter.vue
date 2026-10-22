<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ChartScatterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 5; i++) {
      animation[`circle${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            ease: 'easeInOut',
            duration: 0.3,
            delay: (i - 1) * 0.3,
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ChartScatter', inheritAttrs: false })
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
      <motion.circle
        cx="7.5"
        cy="7.5"
        r=".5"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="18.5"
        cy="5.5"
        r=".5"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="11.5"
        cy="11.5"
        r=".5"
        :variants="variants.circle3"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="7.5"
        cy="16.5"
        r=".5"
        :variants="variants.circle4"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="17.5"
        cy="14.5"
        r=".5"
        :variants="variants.circle5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 3v16a2 2 0 0 0 2 2h16"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
