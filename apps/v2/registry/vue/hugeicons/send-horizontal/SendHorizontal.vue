<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SendHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        x: 0,
      },
      animate: {
        scale: [1, 0.8, 1, 1, 1],
        x: [0, '-10%', '125%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 1.2 },
          x: {
            ease: 'easeInOut',
            duration: 1.2,
            times: [0, 0.25, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SendHorizontal', inheritAttrs: false })
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
          d="M10.325 5.33455L16.1084 8.24495C19.3643 9.88342 20.9922 10.7027 20.9922 12C20.9922 13.2973 19.3643 14.1166 16.1084 15.7551L10.325 18.6655C6.63532 20.5223 4.79046 21.4507 3.7862 20.7851C3.57349 20.6441 3.38825 20.4651 3.23962 20.2569C2.53788 19.2741 3.3843 17.381 5.07715 13.5948C5.39957 12.8736 5.56078 12.5131 5.58462 12.1319C5.59011 12.044 5.59011 11.956 5.58462 11.8681C5.56078 11.4869 5.39957 11.1264 5.07715 10.4052C3.3843 6.61898 2.53788 4.72586 3.23962 3.74307C3.38825 3.53492 3.57349 3.35593 3.7862 3.21495C4.79046 2.54933 6.63532 3.47774 10.325 5.33455Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M9.49219 12H13.4922"
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
