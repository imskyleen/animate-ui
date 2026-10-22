<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FilterHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { d: 'M3 7L6 7' },
      animate: {
        d: 'M3 7L9 7',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: { x: 3, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M15 7L21 7' },
      animate: {
        d: 'M18 7L21 7',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line4: {
      initial: { d: 'M3 17L9 17' },
      animate: {
        d: 'M3 17L6 17',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: { x: -3, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line6: {
      initial: { d: 'M18 17L21 17' },
      animate: {
        d: 'M15 17L21 17',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M3 7L6 7' },
      animate: {
        d: ['M3 7L6 7', 'M3 7L9 7', 'M3 7L6 7'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M15 7L21 7' },
      animate: {
        d: ['M15 7L21 7', 'M18 7L21 7', 'M15 7L21 7'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M3 17L9 17' },
      animate: {
        d: ['M3 17L9 17', 'M3 17L6 17', 'M3 17L9 17'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line6: {
      initial: { d: 'M18 17L21 17' },
      animate: {
        d: ['M18 17L21 17', 'M15 17L21 17', 'M18 17L21 17'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FilterHorizontal', inheritAttrs: false })
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
      <motion.path
        d="M3 7L6 7"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 7L21 7"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 17L9 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18 17L21 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
