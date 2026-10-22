<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiCogProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    cog: {
      initial: { rotate: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
      animate: {
        rotate: 120,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
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
    wave4: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.36 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    cog: {},
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
    wave4: {
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
            delay: 0.6,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.6,
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

defineOptions({ name: 'WifiCog', inheritAttrs: false })
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
        d="M20.6709 15.7593C20.8803 16.1249 21 16.5485 21 17C21 17.4514 20.8804 17.8749 20.671 18.2404C20.2402 18.993 19.4293 19.5 18.5 19.5M16.3291 15.7593C16.1197 16.1249 16 16.5485 16 17C16 17.4514 16.1196 17.8749 16.329 18.2404C16.7598 18.993 17.5707 19.5 18.5 19.5M18.5 19.5L18.5 21M18.5 14.5C19.4292 14.5 20.24 15.0069 20.6709 15.7593M18.5 14.5C17.5708 14.5 16.76 15.0069 16.3291 15.7593M18.5 14.5L18.5 13M22 14.9998L20.6709 15.7593M15 18.9998L16.329 18.2404M22 18.9998L20.671 18.2404M15 14.9998L16.3291 15.7593"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.cog"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.1256 17.75H12.0006M12.2506 17.75C12.2506 17.8881 12.1387 18 12.0006 18C11.8625 18 11.7506 17.8881 11.7506 17.75C11.7506 17.6119 11.8625 17.5 12.0006 17.5C12.1387 17.5 12.2506 17.6119 12.2506 17.75Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M13 12.101C12.6733 12.0343 12.3384 12 12 12C10.6912 12 9.43464 12.5132 8.5 13.4293"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17 9.33984C15.4923 8.4694 13.77 8.00012 12 8.00012C9.38247 8.00012 6.86929 9.02642 5 10.8587"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 6.81966C4.75011 4.35989 8.31034 3 12 3C15.6897 3 19.2499 4.35989 22 6.81966"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
