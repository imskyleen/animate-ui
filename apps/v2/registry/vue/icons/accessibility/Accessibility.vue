<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AccessibilityProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: -360,
        transition: {
          duration: 1,
          delay: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, -1, 0],
        x: [0, 1, -1, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        rotate: 0,
        d: 'M8 5 L5 8',
      },
      animate: {
        rotate: [0, -60, 0],
        d: ['M8 5 L5 8', 'M8 5 L4 9', 'M8 5 L5 8'],
        transition: {
          duration: 0.4,
          delay: 0.2,
          ease: 'easeInOut',
        },
        transformOrigin: 'top right',
      },
    },
    path4: {},
    path5: {},
    path6: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Accessibility', inheritAttrs: false })
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
      <motion.circle
        cx="16"
        cy="4"
        r="1"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.group1"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M18,19l1-7-6,1"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8,5l5.5,3-2.4,3.5"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8 5 L5 8"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.g
        :variants="variants.group2"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M4.2,14.5c-.8,2.6.7,5.4,3.3,6.2,1.2.4,2.4.3,3.6-.2"
          :variants="variants.path4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M13.8,17.5c.8-2.6-.7-5.4-3.3-6.2-1.2-.4-2.4-.3-3.6.2"
          :variants="variants.path5"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M13,13.1c-.5-.7-1.1-1.2-1.9-1.6"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
