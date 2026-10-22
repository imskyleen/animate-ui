<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GhostProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    eyes: {},
    ghost: {
      initial: { y: 0, skewX: 0 },
      animate: {
        y: [0, -1, 0, -0.5, 0],
        skewX: [0, 3, -3, 1.5, 0],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  look: {
    ghost: {},
    eyes: {
      initial: { x: 0 },
      animate: {
        x: [0, -1.8, -1.8, 1.8, 1.8, 0],
        transition: {
          duration: 1.4,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
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

defineOptions({ name: 'Ghost', inheritAttrs: false })
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
        :variants="variants.ghost"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M12 2.5C8.13924 2.5 5.00948 5.61997 5.00948 9.46865V11.7676C5.00948 14.1753 4.37917 16.5414 3.18085 18.6319C2.532 19.7638 3.74988 21.0472 4.91961 20.4642L5.84783 20.0015C6.52687 19.6631 7.35027 19.8348 7.83629 20.4162L8.25508 20.9172C8.90472 21.6943 10.1021 21.6943 10.7517 20.9172C11.0765 20.5286 11.5383 20.3343 12 20.3343C12.4617 20.3343 12.9235 20.5286 13.2483 20.9172C13.8979 21.6943 15.0953 21.6943 15.7449 20.9172L16.1637 20.4162C16.6497 19.8348 17.4731 19.6631 18.1522 20.0015L19.0804 20.4642C20.2501 21.0472 21.468 19.7638 20.8192 18.6319C19.6208 16.5414 18.9905 14.1753 18.9905 11.7676V9.46865C18.9905 5.61997 15.8608 2.5 12 2.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <motion.g
          :variants="variants.eyes"
          initial="initial"
          :animate="controls"
        >
          <path
            d="M15 10.125V10.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15.25 10.25C15.25 10.3881 15.1381 10.5 15 10.5C14.8619 10.5 14.75 10.3881 14.75 10.25C14.75 10.1119 14.8619 10 15 10C15.1381 10 15.25 10.1119 15.25 10.25Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 10.125V10.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.25 10.25C9.25 10.3881 9.13807 10.5 9 10.5C8.86193 10.5 8.75 10.3881 8.75 10.25C8.75 10.1119 8.86193 10 9 10C9.13807 10 9.25 10.1119 9.25 10.25Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
