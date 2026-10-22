<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiSyncProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sync: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
      animate: {
        rotate: 180,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          scale: { duration: 0.8, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] },
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    wave3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    sync: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    wave1: {
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
    wave2: {
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
    wave3: {
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
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiSync', inheritAttrs: false })
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
      stroke-linecap="round"
      stroke-linejoin="round"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.sync"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M11.965 10.105v4L13.5 12.5a5 5 0 0 1 8 1.5"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M11.965 14.105h4"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M17.965 18.105h4L20.43 19.71a5 5 0 0 1-8-1.5"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M21.965 22.105v-4"
          :variants="variants.path4"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M8.5 16.429h.01"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 12.86a10 10 0 0 1 3-2.032"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 8.82a15 15 0 0 1 20 0"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
