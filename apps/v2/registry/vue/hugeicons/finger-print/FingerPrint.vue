<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FingerPrintProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.0 },
      },
    },
    line2: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line3: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.2 },
      },
    },
    line4: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.3 },
      },
    },
    line5: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.4 },
      },
    },
    line6: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0.5 },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  'default-2': {
    line1: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    line2: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    line3: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    line4: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    line5: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    line6: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.05, 1],
        transition: { duration: 1.6, ease: 'easeInOut', delay: 0 },
      },
    },
    group: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.9, 1],
        transition: { duration: 1.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FingerPrint', inheritAttrs: false })
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
          d="M7.42857 3.36201C11.3996 0.664089 17.136 2.12432 19.2301 6.41803"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M10.8571 21.9236C15.5839 22.5822 20 18.8952 20 14.2103V10.3333"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7.42857 20.6058C5.35602 19.1977 4 16.8583 4 14.2103V9.75757C4 8.57285 4.27144 7.44988 4.75704 6.44444"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M16 13.8C16 16.1196 14.2091 18 12 18C9.79086 18 8 16.1196 8 13.8V10.2C8 9.55584 8.13811 8.94555 8.38493 8.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 6C14.2091 6 16 7.8804 16 10.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line5"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 10.5L12 13.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.line6"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
