<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BluetoothProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rune: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.88, 1.06, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    dots: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0, 1, 0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Bluetooth', inheritAttrs: false })
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
        :variants="variants.rune"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M12.4742 12L16.2428 9.05534C17.3189 8.21451 17.857 7.79409 17.9716 7.24865C18.0144 7.04517 18.0154 6.83493 17.9748 6.63101C17.8657 6.08438 17.332 5.65832 16.2645 4.8062C14.6552 3.52156 13.8505 2.87924 13.1738 3.01878C12.9267 3.06975 12.6962 3.18351 12.504 3.34942C11.9779 3.80362 11.9779 4.84315 11.9779 6.92221V11.6122"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.4742 12L11.9779 12.3877"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.4742 12L16.2428 14.9446C17.319 15.7855 17.857 16.2059 17.9716 16.7513C18.0144 16.9548 18.0155 17.165 17.9748 17.369C17.8658 17.9156 17.332 18.3417 16.2645 19.1938C14.6552 20.4784 13.8505 21.1208 13.1738 20.9812C12.9266 20.9302 12.6962 20.8165 12.504 20.6506C11.9779 20.1964 11.9779 19.1568 11.9779 17.0778V12.3877"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.4742 12L11.9779 11.6122"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.9779 12.3877L6.00452 17.055"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.9779 12.3877V11.6122"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.9779 11.6122L6.00452 6.94494"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.g
        :variants="variants.dots"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M5.37952 12H5.25452"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.8795 12H18.7545"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.50452 12C5.50452 12.1381 5.39259 12.25 5.25452 12.25C5.11645 12.25 5.00452 12.1381 5.00452 12C5.00452 11.8619 5.11645 11.75 5.25452 11.75C5.39259 11.75 5.50452 11.8619 5.50452 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.0045 12C19.0045 12.1381 18.8926 12.25 18.7545 12.25C18.6164 12.25 18.5045 12.1381 18.5045 12C18.5045 11.8619 18.6164 11.75 18.7545 11.75C18.8926 11.75 19.0045 11.8619 19.0045 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
