<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ExpandProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {},
    group2: {
      initial: { y: 0, x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: {
        y: -2,
        x: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    group3: {
      initial: { y: 0, x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: {
        y: 2,
        x: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    group4: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {},
    group2: {
      initial: { y: 0, x: 0 },
      animate: {
        y: [0, -2, 0],
        x: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group3: {
      initial: { y: 0, x: 0 },
      animate: {
        y: [0, 2, 0],
        x: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group4: {},
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

defineOptions({ name: 'Expand', inheritAttrs: false })
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
        d="M19 12L19 8.99996C19 7.11435 18.9999 6.17155 18.4142 5.58577C17.8284 4.99999 16.8856 4.99999 15 5L12 5.00001"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.group2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 12L5.00003 15C5.00004 16.8856 5.00005 17.8284 5.58584 18.4142C6.17163 19 7.11443 19 9.00004 19L12 19"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.group3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
