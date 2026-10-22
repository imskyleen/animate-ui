<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SquarePlusProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SquarePlus', inheritAttrs: false })
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
        d="M2.49219 12C2.49219 7.77027 2.49219 5.6554 3.69016 4.25276C3.86027 4.05358 4.04577 3.86808 4.24495 3.69797C5.64759 2.5 7.76246 2.5 11.9922 2.5C16.2219 2.5 18.3368 2.5 19.7394 3.69797C19.9386 3.86808 20.1241 4.05358 20.2942 4.25276C21.4922 5.6554 21.4922 7.77027 21.4922 12C21.4922 16.2297 21.4922 18.3446 20.2942 19.7472C20.1241 19.9464 19.9386 20.1319 19.7394 20.302C18.3368 21.5 16.2219 21.5 11.9922 21.5C7.76246 21.5 5.64759 21.5 4.24495 20.302C4.04577 20.1319 3.86027 19.9464 3.69016 19.7472C2.49219 18.3446 2.49219 16.2297 2.49219 12Z"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7.99219 12L15.9922 12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11.9922 16L11.9922 8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
