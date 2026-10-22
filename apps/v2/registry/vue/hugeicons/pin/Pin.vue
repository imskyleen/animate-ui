<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PinProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        rotate: [0, -6, 4, -2, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  bounce: {
    path1: {},
    path2: {},
    group: {
      initial: { scale: 1, rotate: 0, y: 0, transformOrigin: '0% 100%' },
      animate: {
        scale: [1, 0.75, 1, 1],
        rotate: [0, 20, -4, 0],
        y: [0, -3, 0, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    path1: {},
    path2: {},
    group: {
      initial: { rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        rotate: [0, 8, -6, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    path1: {},
    path2: {},
    group: {
      initial: { transform: 'rotate3d(0, 1, 0, 0deg)', perspective: 600 },
      animate: {
        transform: 'rotate3d(0, 1, 0, 360deg)',
        perspective: 600,
        transition: { ease: 'easeInOut', duration: 0.7 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Pin', inheritAttrs: false })
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
          d="M3 21L8 16"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M13.2585 18.8714C9.51516 18.0215 5.97844 14.4848 5.12853 10.7415C4.99399 10.1489 4.92672 9.85266 5.12161 9.37197C5.3165 8.89129 5.55457 8.74255 6.03071 8.44509C7.10705 7.77265 8.27254 7.55888 9.48209 7.66586C11.1793 7.81598 12.0279 7.89104 12.4512 7.67048C12.8746 7.44991 13.1622 6.93417 13.7376 5.90269L14.4664 4.59604C14.9465 3.73528 15.1866 3.3049 15.7513 3.10202C16.316 2.89913 16.6558 3.02199 17.3355 3.26771C18.9249 3.84236 20.1576 5.07505 20.7323 6.66449C20.978 7.34417 21.1009 7.68401 20.898 8.2487C20.6951 8.8134 20.2647 9.05346 19.4039 9.53358L18.0672 10.2792C17.0376 10.8534 16.5229 11.1406 16.3024 11.568C16.0819 11.9955 16.162 12.8256 16.3221 14.4859C16.4399 15.7068 16.2369 16.88 15.5555 17.9697C15.2577 18.4458 15.1088 18.6839 14.6283 18.8786C14.1477 19.0733 13.8513 19.006 13.2585 18.8714Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
