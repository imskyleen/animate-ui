<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ClockFadingProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    face1: {},
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ClockFading', inheritAttrs: false })
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
        d="M5.43823 19.5496C6.54888 20.5162 7.89133 21.2512 9.40963 21.6576C10.2751 21.8893 11.1446 22 12 22M16.5374 20.906C17.6966 20.3145 18.7389 19.4992 19.5953 18.5M21.6561 14.5847C21.9352 13.5441 22.0395 12.4978 21.9868 11.4771M20.9103 7.46053C20.699 7.04586 20.4591 6.64615 20.1924 6.26456M16.4698 3.05251C15.8798 2.7588 15.2517 2.51942 14.5904 2.34238C9.25745 0.914877 3.77452 4.08152 2.3439 9.41528C1.78336 11.5051 1.92809 13.6176 2.63227 15.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.face1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 6L12 12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.minute"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 14L12 12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.hour"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
