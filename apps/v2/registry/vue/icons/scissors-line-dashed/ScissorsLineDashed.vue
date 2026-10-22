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
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0, -26, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
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
      stroke-linecap="round"
      stroke-linejoin="round"
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
            cx="4"
            cy="8"
            r="2"
            :variants="variants.circle1"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M5.42 9.42 8 12"
            :variants="variants.path1"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M10.8 14.8 14 18"
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
            cx="4"
            cy="16"
            r="2"
            :variants="variants.circle2"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="m14 6-8.58 8.58"
            :variants="variants.path3"
            initial="initial"
            :animate="controls"
          />
        </motion.g>
      </motion.g>
      <motion.path
        d="M16 12h-2"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 12h-2"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
