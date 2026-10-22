<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GalleryHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      rect: {},
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1, x: 0 },
        animate: {
          opacity: [0, 1],
          scale: [0.8, 1],
          x: [4 * Math.pow(-1, i + 1), 0],
          transition: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  zoom: (() => {
    const animation: Record<string, Variants> = {
      rect: {
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
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, transform: 'translateX(0) scale(1)' },
        animate: {
          opacity: 0,
          transform: `translateX(${8 * Math.pow(-1, i + 1)}px) scale(0)`,
          transition: {
            transform: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.4,
            },
            opacity: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.4,
            },
            scale: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.4,
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  collapse: {
    rect: {},
    path1: {
      initial: { x: 0, scaleY: 1 },
      animate: {
        x: 4,
        scaleY: 0.8,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: { x: 0, scaleY: 1 },
      animate: {
        x: -4,
        scaleY: 0.8,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'GalleryHorizontal', inheritAttrs: false })
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
        d="M2 3v18"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        width="12"
        height="18"
        x="6"
        y="3"
        rx="2"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 3v18"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
