<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PreferenceHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { d: 'M13 4L3 4' },
      animate: {
        d: 'M7 4L3 4',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: { x: -6, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M21 4L19 4' },
      animate: {
        d: 'M21 4L13 4',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line4: {
      initial: { d: 'M5 11.5L3 11.5' },
      animate: {
        d: 'M13 11.5L3 11.5',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: { x: 8, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line6: {
      initial: { d: 'M21 11.5L11 11.5' },
      animate: {
        d: 'M21 11.5L19 11.5',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line7: {
      initial: { d: 'M11 19L3 19' },
      animate: {
        d: 'M6 19L3 19',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line8: {
      initial: { x: 0 },
      animate: { x: -5, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line9: {
      initial: { d: 'M21 19L17 19' },
      animate: {
        d: 'M21 19L12 19',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M13 4L3 4' },
      animate: {
        d: ['M13 4L3 4', 'M7 4L3 4', 'M13 4L3 4'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: {
        x: [0, -6, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M21 4L19 4' },
      animate: {
        d: ['M21 4L19 4', 'M21 4L13 4', 'M21 4L19 4'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M5 11.5L3 11.5' },
      animate: {
        d: ['M5 11.5L3 11.5', 'M13 11.5L3 11.5', 'M5 11.5L3 11.5'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: {
        x: [0, 8, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line6: {
      initial: { d: 'M21 11.5L11 11.5' },
      animate: {
        d: ['M21 11.5L11 11.5', 'M21 11.5L19 11.5', 'M21 11.5L11 11.5'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line7: {
      initial: { d: 'M11 19L3 19' },
      animate: {
        d: ['M11 19L3 19', 'M6 19L3 19', 'M11 19L3 19'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line8: {
      initial: { x: 0 },
      animate: {
        x: [0, -5, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line9: {
      initial: { d: 'M21 19L17 19' },
      animate: {
        d: ['M21 19L17 19', 'M21 19L12 19', 'M21 19L17 19'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PreferenceHorizontal', inheritAttrs: false })
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
        d="M13 4L3 4"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14.5 2C14.9659 2 15.1989 2 15.3827 2.07612C15.6277 2.17761 15.8224 2.37229 15.9239 2.61732C16 2.80109 16 3.03406 16 3.5L16 4.5C16 4.96594 16 5.19891 15.9239 5.38268C15.8224 5.62771 15.6277 5.82239 15.3827 5.92388C15.1989 6 14.9659 6 14.5 6C14.0341 6 13.8011 6 13.6173 5.92388C13.3723 5.82239 13.1776 5.62771 13.0761 5.38268C13 5.19891 13 4.96594 13 4.5L13 3.5C13 3.03406 13 2.80109 13.0761 2.61732C13.1776 2.37229 13.3723 2.17761 13.6173 2.07612C13.8011 2 14.0341 2 14.5 2Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21 4L19 4"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 11.5L3 11.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.5 9.5C9.96594 9.5 10.1989 9.5 10.3827 9.57612C10.6277 9.67761 10.8224 9.87229 10.9239 10.1173C11 10.3011 11 10.5341 11 11L11 12C11 12.4659 11 12.6989 10.9239 12.8827C10.8224 13.1277 10.6277 13.3224 10.3827 13.4239C10.1989 13.5 9.96594 13.5 9.5 13.5C9.03406 13.5 8.80109 13.5 8.61732 13.4239C8.37229 13.3224 8.17761 13.1277 8.07612 12.8827C8 12.6989 8 12.4659 8 12L8 11C8 10.5341 8 10.3011 8.07612 10.1173C8.17761 9.87229 8.37229 9.67761 8.61732 9.57612C8.80109 9.5 9.03406 9.5 9.5 9.5Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21 11.5L11 11.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11 19L3 19"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line7"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.5 17C12.9659 17 13.1989 17 13.3827 17.0761C13.6277 17.1776 13.8224 17.3723 13.9239 17.6173C14 17.8011 14 18.0341 14 18.5L14 19.5C14 19.9659 14 20.1989 13.9239 20.3827C13.8224 20.6277 13.6277 20.8224 13.3827 20.9239C13.1989 21 12.9659 21 12.5 21C12.0341 21 11.8011 21 11.6173 20.9239C11.3723 20.8224 11.1776 20.6277 11.0761 20.3827C11 20.1989 11 19.9659 11 19.5L11 18.5C11 18.0341 11 17.8011 11.0761 17.6173C11.1776 17.3723 11.3723 17.1776 11.6173 17.0761C11.8011 17 12.0341 17 12.5 17Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line8"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21 19L17 19"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line9"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
