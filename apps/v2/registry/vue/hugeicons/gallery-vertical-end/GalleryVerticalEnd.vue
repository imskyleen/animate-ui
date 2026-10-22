<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GalleryVerticalEndProps = IconProps<keyof typeof animations>;

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      rect: {},
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1, y: 0 },
        animate: {
          opacity: [0, 1],
          scale: [0.8, 1],
          y: [2 * i, 0],
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
        initial: { opacity: 1, transform: 'translateY(0) scale(1)' },
        animate: {
          opacity: 0,
          transform: `translateY(${(3 - i) * 3}px) scale(0)`,
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
      initial: { y: 0 },
      animate: {
        y: -4,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: { y: 0 },
      animate: {
        y: 4,
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

defineOptions({ name: 'GalleryVerticalEnd', inheritAttrs: false })
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
        d="M6 1.99756L18 1.99756"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4 5.99805L20 5.99805"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 16.998L3 14.998C3 12.641 3 11.4625 3.73223 10.7303C4.46447 9.99805 5.64298 9.99805 8 9.99805H16C18.357 9.99805 19.5355 9.99805 20.2678 10.7303C21 11.4625 21 12.641 21 14.998V16.998C21 19.3551 21 20.5336 20.2678 21.2658C19.5355 21.998 18.357 21.998 16 21.998L8 21.998C5.64298 21.998 4.46447 21.998 3.73223 21.2658C3 20.5336 3 19.3551 3 16.998Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
