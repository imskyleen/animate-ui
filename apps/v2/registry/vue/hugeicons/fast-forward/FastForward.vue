<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FastForwardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    back: {
      initial: { x: 0 },
      animate: {
        x: [0, 1.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FastForward', inheritAttrs: false })
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
        d="M8.19067 16.2995C5.99362 17.9404 4.89509 18.7608 4.07255 18.34C3.25 17.9192 3.25 16.5502 3.25 13.8124V10.1873C3.25 7.4495 3.25 6.08062 4.07255 5.6598C4.8951 5.23897 5.99359 6.05938 8.19057 7.7002C9.20752 8.45971 10.2263 9.21653 11.2386 9.9805C11.2386 7.36072 11.2386 6.05082 12.0453 5.62582C12.0628 5.61659 12.0805 5.60771 12.0984 5.59918C12.921 5.20683 13.9497 6.00067 16.007 7.58835L18.5961 9.5863C20.032 10.6944 20.75 11.2485 20.75 11.9999C20.75 12.7513 20.032 13.3054 18.5961 14.4136L16.0072 16.4115C13.9497 17.9993 12.921 18.7932 12.0983 18.4008C12.0805 18.3923 12.0628 18.3834 12.0454 18.3742C11.2386 17.9493 11.2386 16.6393 11.2386 14.0193C10.2263 14.7832 9.20759 15.54 8.19067 16.2995Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.back"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
