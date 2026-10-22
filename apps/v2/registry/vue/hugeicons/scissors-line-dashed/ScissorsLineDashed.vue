<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ScissorsLineDashedProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: 7,
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group1: {
      initial: { transformOrigin: '54.5% 54.5%', rotate: 0 },
      animate: {
        transformOrigin: '54.5% 54.5%',
        rotate: [0, -26, 0, -26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: { transformOrigin: '54.5% 45.5%', rotate: 0 },
      animate: {
        transformOrigin: '54.5% 45.5%',
        rotate: [0, 26, 0, 26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
          delay: 0.25,
        },
      },
    },
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
          delay: 0.85,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ScissorsLineDashed', inheritAttrs: false })
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
        <motion.g
          :variants="variants.group1"
          initial="initial"
          :animate="controls"
        >
          <motion.circle
            :cx="4.49219"
            :cy="8"
            :r="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.circle1"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M6.49219 10L8.49219 12"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.path1"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M10.9922 14.5L13.4922 17"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.path2"
            initial="initial"
            :animate="controls"
          />
        </motion.g>
        <motion.g
          :variants="variants.group2"
          initial="initial"
          :animate="controls"
        >
          <motion.circle
            :cx="4.49219"
            :cy="16"
            :r="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.circle2"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M13.4922 7L8.49219 12M8.49219 12L6.49219 14"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.path3"
            initial="initial"
            :animate="controls"
          />
        </motion.g>
      </motion.g>
      <motion.path
        d="M15.4922 12L13.4922 12"
        stroke-linecap="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21.4922 12L19.4922 12"
        stroke-linecap="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
