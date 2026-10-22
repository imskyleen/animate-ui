<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MailOpenProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    fold: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    letter: {
      initial: { y: 0 },
      animate: {
        y: [0, -0.9, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  close: {
    fold: {},
    letter: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, 5, 5, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 1.2,
          times: [0, 0.35, 0.65, 1],
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

defineOptions({ name: 'MailOpen', inheritAttrs: false })
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
      <path
        d="M5.00035 7L3.78154 7.81253C2.90783 8.39501 2.47097 8.68625 2.23422 9.13041C1.99747 9.57457 1.99923 10.0966 2.00273 11.1406C2.00696 12.3975 2.01864 13.6782 2.05099 14.9741C2.12773 18.0487 2.16611 19.586 3.29651 20.7164C4.42691 21.8469 5.98497 21.8858 9.10108 21.9637C11.0397 22.0121 12.9611 22.0121 14.8996 21.9637C18.0158 21.8858 19.5738 21.8469 20.7042 20.7164C21.8346 19.586 21.873 18.0487 21.9497 14.9741C21.9821 13.6782 21.9937 12.3975 21.998 11.1406C22.0015 10.0966 22.0032 9.57456 21.7665 9.13041C21.5297 8.68625 21.0929 8.39501 20.2191 7.81253L19.0003 7"
        stroke-linejoin="round"
      />
      <motion.path
        d="M2 10L8.91302 14.1478C10.417 15.0502 11.169 15.5014 12 15.5014C12.831 15.5014 13.583 15.0502 15.087 14.1478L22 10"
        stroke-linejoin="round"
        :variants="variants.fold"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.letter"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M4.99998 12V6C4.99998 4.11438 4.99998 3.17157 5.58577 2.58579C6.17156 2 7.11437 2 8.99998 2H15C16.8856 2 17.8284 2 18.4142 2.58579C19 3.17157 19 4.11438 19 6V12"
        />
        <path
          d="M10 10H14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 6H14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
