<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CherryProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    cherry1: {
      initial: { rotate: 0, transformOrigin: '13.7946px 4px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '13.7946px 4px',
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    cherry2: {
      initial: { rotate: 0, transformOrigin: '13.7946px 4px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '13.7946px 4px',
        transition: { duration: 1, ease: 'easeInOut', delay: 0.06 },
      },
    },
  } satisfies Record<string, Variants>,
  swing: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -7, 4, -2, 0],
        transformOrigin: 'top center',
        transition: {
          duration: 0.8,
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

defineOptions({ name: 'Cherry', inheritAttrs: false })
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
        :variants="variants.cherry1"
        initial="initial"
        :animate="controls"
        :style="{ transformBox: 'view-box' }"
      >
        <path
          d="M10.5 11C9.62217 10.37 8.55171 10 7.39646 10C4.41608 10 2 12.4624 2 15.5C2 18.5376 4.41608 21 7.39646 21C8.08877 21 8.75062 20.8671 9.35882 20.6251"
          stroke-linecap="round"
        />
        <path
          d="M7.13408 12C6.09142 6.5 11.4006 4.5 13.7946 4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.g
        :variants="variants.cherry2"
        initial="initial"
        :animate="controls"
        :style="{ transformBox: 'view-box' }"
      >
        <path
          d="M22 16.5C22 19.5376 19.5376 22 16.5 22C13.4624 22 11 19.5376 11 16.5C11 13.4624 13.4624 11 16.5 11C19.5376 11 22 13.4624 22 16.5Z"
        />
        <path
          d="M13.7946 4C11.7291 7.13692 14.1631 11.1035 16 13"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <path
        d="M16 2C14.9847 2.59904 14.2703 3.27752 13.7946 4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </motion.svg>
  </IconWrapper>
</template>
