<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RefreshCcwProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: 'spring', stiffness: 100, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'RefreshCcw', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M20.9373 13C20.9736 12.6717 20.9922 12.338 20.9922 12C20.9922 7.02944 16.9628 3 11.9922 3C9.16492 3 6.64214 4.30367 4.99219 6.34267"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.99219 3L3.99219 4C3.99219 5.41421 3.99219 6.12132 4.43153 6.56066C4.87087 7 5.57797 7 6.99219 7L7.99219 7"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.04712 11C3.01082 11.3283 2.99219 11.662 2.99219 12C2.99219 16.9706 7.02162 21 11.9922 21C14.8195 21 17.3422 19.6963 18.9922 17.6573"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15.9922 17H16.9922C18.4064 17 19.1135 17 19.5528 17.4393C19.9922 17.8787 19.9922 18.5858 19.9922 20V21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
