<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LoaderProps = IconProps<keyof typeof animations>;

const SEGMENT_COUNT = 8;
const DURATION = 1.2;
const BASE_OPACITY = 0.25;

export const animations = {
  default: (() => {
    const spinner: Record<string, Variants> = {
      group: { initial: {}, animate: {} },
    };

    for (let i = 1; i <= SEGMENT_COUNT; i++) {
      const reverseIndex = SEGMENT_COUNT - i;
      const delay = -(reverseIndex * DURATION) / SEGMENT_COUNT;

      spinner[`path${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [1, BASE_OPACITY],
          transition: {
            duration: DURATION,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
            delay,
          },
        },
      };
    }

    return spinner as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  spin: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Loader', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M12 2v4"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m16.2 7.8 2.9-2.9"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18 12h4"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m16.2 16.2 2.9 2.9"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 18v4"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m4.9 19.1 2.9-2.9"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 12h4"
        :variants="variants.path7"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m4.9 4.9 2.9 2.9"
        :variants="variants.path8"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
