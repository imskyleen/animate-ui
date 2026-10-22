<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ZoomInProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 1.1, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sign: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ZoomIn', inheritAttrs: false })
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
        :variants="variants.lens"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M17 17L21 21"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <motion.g
          :variants="variants.sign"
          initial="initial"
          :animate="controls"
        >
          <path
            d="M7.5 11L14.5 11"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11 7.5V14.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
