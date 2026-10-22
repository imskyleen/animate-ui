<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UserCogProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -2, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 4, -2, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180],
        transition: {
          duration: 1.25,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    path: {},
    circle: {},
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: 'linear',
          repeat: Infinity,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'UserCog', inheritAttrs: false })
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
      <motion.path
        d="M10 15H6a4 4 0 0 0-4 4v2"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="9"
        :cy="7"
        :r="4"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
        :style="{ transformOrigin: '18px 15px' }"
      >
        <path
          d="m14.305 16.53.923-.382"
        />
        <path
          d="m15.228 13.852-.923-.383"
        />
        <path
          d="m16.852 12.228-.383-.923"
        />
        <path
          d="m16.852 17.772-.383.924"
        />
        <path
          d="m19.148 12.228.383-.923"
        />
        <path
          d="m19.53 18.696-.382-.924"
        />
        <path
          d="m20.772 13.852.924-.383"
        />
        <path
          d="m20.772 16.148.924.383"
        />
        <circle
          :cx="18"
          :cy="15"
          :r="3"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
