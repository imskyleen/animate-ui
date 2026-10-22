<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GalleryVerticalProps = IconProps<keyof typeof animations>;

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
          y: [4 * Math.pow(-1, i + 1), 0],
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
        initial: { opacity: 1, transform: 'translateY(0) scale(1)' },
        animate: {
          opacity: 0,
          transform: `translateY(${3 * Math.pow(-1, i + 1)}px) scale(0)`,
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
      initial: { y: 0, scaleX: 1 },
      animate: {
        y: 4,
        scaleX: 0.8,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: { y: 0, scaleX: 1 },
      animate: {
        y: -4,
        scaleX: 0.8,
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

defineOptions({ name: 'GalleryVertical', inheritAttrs: false })
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
        d="M6 1.99951L18 1.99951"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 10.9995V12.9995C3 15.3565 3 16.535 3.73223 17.2673C4.46447 17.9995 5.64298 17.9995 8 17.9995H16C18.357 17.9995 19.5355 17.9995 20.2678 17.2673C21 16.535 21 15.3565 21 12.9995V10.9995C21 8.64249 21 7.46398 20.2678 6.73174C19.5355 5.99951 18.357 5.99951 16 5.99951L8 5.99951C5.64298 5.99951 4.46447 5.99951 3.73223 6.73174C3 7.46398 3 8.64249 3 10.9995Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 21.9995L18 21.9995"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
