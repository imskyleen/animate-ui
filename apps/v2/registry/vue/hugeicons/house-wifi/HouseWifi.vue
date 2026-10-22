<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type HouseWifiProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 },
      },
    },
    path3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.3 },
      },
    },
    path4: {},
  } satisfies Record<string, Variants>,
  blink: {
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
    path2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
        },
      },
    },
    path3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.4,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.4,
          },
        },
      },
    },
    path4: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'HouseWifi', inheritAttrs: false })
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
        d="M20.4999 5L20.5093 13.535C20.5093 17.3062 20.5093 19.1918 19.3377 20.3634C18.5295 21.1716 17.3816 21.4222 15.5093 21.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M22 10.0007L13.7682 3.14089C13.2718 2.72724 12.6461 2.5007 12 2.5007C11.3539 2.5007 10.7282 2.72723 10.2318 3.14089L2 10.0007"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.g
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M4.025 21.4625V21.475"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4.05 21.475C4.05 21.4612 4.03881 21.45 4.025 21.45C4.01119 21.45 4 21.4612 4 21.475C4 21.4888 4.01119 21.5 4.025 21.5C4.03881 21.5 4.05 21.4888 4.05 21.475Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.path
        d="M8 21.5C8 19.2909 6.20912 17.5 4 17.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 21.5C12 17.0817 8.41824 13.5 4 13.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
