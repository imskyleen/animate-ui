<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BotOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-7%', '7%', '-7%', '7%', 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path5: {},
    path6: {},
    path7: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BotOff', inheritAttrs: false })
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
        d="M13.67 8H18a2 2 0 0 1 2 2v4.33"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 14h2"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20 14h2"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m2 2 20 20"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 8H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 1.414-.586"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9 13v2"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.67 4H12v2.33"
        :variants="variants.path7"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
