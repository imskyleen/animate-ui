<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FlagProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    cloth: {
      initial: { skewY: 0, scaleX: 1, transformOrigin: '0% 50%' },
      animate: {
        skewY: [0, 3, -3, 1.5, 0],
        scaleX: [1, 0.9, 1, 0.95, 1],
        transformOrigin: '0% 50%',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Flag', inheritAttrs: false })
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
        d="M5.0249 21C5.04385 19.2643 5.04366 17.5541 5.0366 15.9209"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.0366 15.9209C5.01301 10.4614 4.91276 5.86186 5.19475 4.04271"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M5.19475 4.04271C5.5611 1.67939 9.39301 3.82993 13.9703 5.59842L16.0328 6.48729C17.5508 7.1415 19.7187 8.30352 18.7662 9.66084C18.3738 10.22 17.56 10.8596 16.0575 11.567L5.0366 15.9209"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.cloth"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
