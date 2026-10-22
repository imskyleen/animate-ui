<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GalleryHorizontalEndProps = IconProps<keyof typeof animations>;

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
          x: [2 * i, 0],
          transition: {
            delay: 0.2 * (2 - i),
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
          transform: `translateX(${(3 - i) * 3}px) scale(0)`,
          transition: {
            transform: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.8 - 0.2 * i,
            },
            opacity: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.8 - 0.2 * i,
            },
            scale: {
              duration: 0.2,
              ease: 'easeInOut',
              repeat: 1,
              repeatType: 'reverse',
              repeatDelay: 0.8 - 0.2 * i,
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  collapse: {
    rect: {
      initial: { x: 0 },
      animate: {
        x: -4,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: { x: 0 },
      animate: {
        x: 4,
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

defineOptions({ name: 'GalleryHorizontalEnd', inheritAttrs: false })
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
        d="M3 8V16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 6V18"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11 15V9C11 7.13077 11 6.19615 11.4019 5.5C11.6652 5.04394 12.0439 4.66523 12.5 4.40192C13.1962 4 14.1308 4 16 4C17.8692 4 18.8038 4 19.5 4.40192C19.9561 4.66523 20.3348 5.04394 20.5981 5.5C21 6.19615 21 7.13077 21 9V15C21 16.8692 21 17.8038 20.5981 18.5C20.3348 18.9561 19.9561 19.3348 19.5 19.5981C18.8038 20 17.8692 20 16 20C14.1308 20 13.1962 20 12.5 19.5981C12.0439 19.3348 11.6652 18.9561 11.4019 18.5C11 17.8038 11 16.8692 11 15Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
