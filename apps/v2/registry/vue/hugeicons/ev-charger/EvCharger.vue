<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EvChargerProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: { duration: 1.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'EvCharger', inheritAttrs: false })
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
        d="M2.75 21H15.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15 21V8.5C15 6.15442 15 4.98164 14.3801 4.17372C14.2205 3.96572 14.0343 3.77954 13.8263 3.61994C13.0184 3 11.8456 3 9.5 3C7.15442 3 5.98164 3 5.17372 3.61994C4.96572 3.77954 4.77954 3.96572 4.61994 4.17372C4 4.98164 4 6.15442 4 8.5V21"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17.75 5C18.2144 5 18.4466 5 18.6416 5.02567C19.9878 5.2029 21.0471 6.26222 21.2243 7.60842C21.25 7.80337 21.25 8.03558 21.25 8.5V17.25C21.25 18.2165 20.4665 19 19.5 19C18.5335 19 17.75 18.2165 17.75 17.25V15.75C17.75 15.0522 17.75 14.7033 17.6639 14.4194C17.47 13.7802 16.9698 13.28 16.3306 13.0861C16.0467 13 15.6978 13 15 13"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.5 17H11.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M9.25 7L8.29498 8.91459C8.05232 9.40106 7.93099 9.6443 8.04065 9.82215C8.15031 10 8.42161 10 8.96421 10H9.53579C10.0784 10 10.3497 10 10.4594 10.1779C10.569 10.3557 10.4477 10.5989 10.205 11.0854L9.25 13"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
