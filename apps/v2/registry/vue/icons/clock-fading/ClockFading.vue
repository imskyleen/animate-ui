<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ClockFadingProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    face1: {},
    face2: {},
    face3: {},
    face4: {},
    face5: {},
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
      stroke-linecap="round"
      stroke-linejoin="round"
      v-bind="attrs"
    >
      <motion.path
        d="M12 2a10 10 0 0 1 7.38 16.75"
        :variants="variants.face1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2.5 8.875a10 10 0 0 0-.5 3"
        :variants="variants.face2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2.83 16a10 10 0 0 0 2.43 3.4"
        :variants="variants.face3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4.636 5.235a10 10 0 0 1 .891-.857"
        :variants="variants.face4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.644 21.42a10 10 0 0 0 7.631-.38"
        :variants="variants.face5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 6V12"
        :variants="variants.minute"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 12L16 14"
        :variants="variants.hour"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
