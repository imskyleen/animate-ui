<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RotateCcwProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        scale: 0.85,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 170, damping: 26 },
      },
      animate: {
        rotate: -360,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          rotate: { type: 'spring', stiffness: 170, damping: 26, delay: 0.1 },
          scale: {
            duration: 1.4,
            ease: 'easeInOut',
            times: [0, 0.07, 0.85, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'RotateCcw', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M3.99219 2V5.13219C3.99219 5.42605 4.35943 5.55908 4.54746 5.33333C6.37759 3.2875 9.03718 2 11.9973 2C17.5173 2 21.9922 6.47715 21.9922 12C21.9922 15.9582 19.6937 19.3793 16.3592 21"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.7269 22.0003C12.1938 22.0003 12.6533 21.9691 13.1033 21.9086"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.25756 8.66699C2.14516 9.06418 2.05696 9.4656 1.99219 9.86925"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.02676 13.5383C2.09706 13.9384 2.18863 14.3345 2.30071 14.7247"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3.8251 17.9966C4.06343 18.35 4.32178 18.6902 4.59928 19.0149"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.42075 21.361C7.77446 21.5634 8.14261 21.7466 8.52446 21.9086"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
