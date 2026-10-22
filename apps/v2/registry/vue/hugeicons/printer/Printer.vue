<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PrinterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    body: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.3, 0.3, -0.3, 0.3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sheet: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Printer', inheritAttrs: false })
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
        :variants="variants.body"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M17 17H18.6667C19.9128 17 20.5359 17 21 16.7321C21.304 16.5565 21.5565 16.304 21.732 16C22 15.5359 22 14.9128 22 13.6667C22 11.1744 22 9.9282 21.4641 9C21.113 8.39192 20.6081 7.88697 20 7.5359C19.0718 7 17.8256 7 15.3333 7H8.66667C6.17436 7 4.9282 7 4 7.5359C3.39192 7.88697 2.88697 8.39192 2.5359 9C2 9.9282 2 11.1744 2 13.6667C2 14.9128 2 15.5359 2.26795 16C2.44349 16.304 2.69596 16.5565 3 16.7321C3.4641 17 4.08718 17 5.33333 17H7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17 7V5C17 3.58579 17 2.87868 16.5607 2.43934C16.1213 2 15.4142 2 14 2H10C8.58579 2 7.87868 2 7.43934 2.43934C7 2.87868 7 3.58579 7 5V7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.8748 10.25H18.7498"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.9998 10.25C18.9998 10.3881 18.8879 10.5 18.7498 10.5C18.6117 10.5 18.4998 10.3881 18.4998 10.25C18.4998 10.1119 18.6117 10 18.7498 10C18.8879 10 18.9998 10.1119 18.9998 10.25Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.path
        d="M17 14V19C17 20.4142 17 21.1213 16.5607 21.5607C16.1213 22 15.4142 22 14 22H10C8.58579 22 7.87868 22 7.43934 21.5607C7 21.1213 7 20.4142 7 19V14H17Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.sheet"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
