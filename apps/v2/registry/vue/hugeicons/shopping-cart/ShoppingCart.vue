<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ShoppingCartProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, 0.8, -0.3, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.4, 0.75, 1],
        },
      },
    },
    basket: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.4, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ShoppingCart', inheritAttrs: false })
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
        <path
          d="M10.5 20.25C10.5 20.6642 10.1642 21 9.75 21C9.33579 21 9 20.6642 9 20.25C9 19.8358 9.33579 19.5 9.75 19.5C10.1642 19.5 10.5 19.8358 10.5 20.25Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19 20.25C19 20.6642 18.6642 21 18.25 21C17.8358 21 17.5 20.6642 17.5 20.25C17.5 19.8358 17.8358 19.5 18.25 19.5C18.6642 19.5 19 19.8358 19 20.25Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <motion.g
          :variants="variants.basket"
          initial="initial"
          :animate="controls"
        >
          <path
            d="M2 3H2.20664C3.53124 3 4.19354 3 4.6255 3.40221C5.05746 3.80441 5.10464 4.46503 5.19902 5.78626L5.45035 9.30496C5.5924 11.2936 5.66342 12.2879 5.96476 13.0961C6.62531 14.8677 8.08229 16.2244 9.89648 16.757C10.7241 17 11.7267 17 13.7317 17C15.8373 17 16.89 17 17.7417 16.7416C19.6593 16.1599 21.1599 14.6593 21.7416 12.7417C22 11.89 22 10.8433 22 8.75C22 8.05222 22 7.70333 21.9139 7.41943C21.72 6.78023 21.2198 6.28002 20.5806 6.08612C20.2967 6 19.9478 6 19.25 6H5.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16 10V13"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11 10V13"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
