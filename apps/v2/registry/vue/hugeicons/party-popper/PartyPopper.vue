<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PartyPopperProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, 0.5, 0],
        y: [0, -0.5, 0],
        scale: [1, 0.85, 1.05, 1],
        transformOrigin: 'bottom left',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-5, 0],
        y: [5, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: { duration: 0.6 },
      },
    },
    path4: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-8, 0],
        y: [8, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: { duration: 0.6 },
      },
    },
    path5: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-5, 0],
        y: [5, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: { duration: 0.6 },
      },
    },
    path6: {},
    path7: {},
    path8: {},
    path9: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PartyPopper', inheritAttrs: false })
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
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M5.64917 11.0022L4.1788 14.3105C2.32373 18.4844 1.3962 20.5713 2.40852 21.5837C3.42084 22.596 5.5078 21.6685 9.6817 19.8134L12.99 18.343C15.5074 17.2242 16.7661 16.6647 16.9664 15.586C17.1667 14.5073 16.1928 13.5333 14.2448 11.5854L12.4068 9.7474C10.4589 7.79944 9.48487 6.82546 8.40616 7.02575C7.32744 7.22604 6.76802 8.48475 5.64917 11.0022Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.82422 11C7.97359 12.572 10.6237 13.5 13.4906 13.5C14.1707 13.5 14.8386 13.4478 15.4906 13.3471"
          stroke-linecap="round"
        />
        <path
          d="M3.49219 16.5C5.70483 17.7609 8.22705 18.4748 10.904 18.4748C11.44 18.4748 11.9698 18.5312 12.4922 18.4753"
          stroke-linecap="round"
        />
      </motion.g>
      <motion.path
        d="M14.1897 2C14.5888 2.66667 14.908 4.4 12.9924 6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15.9924 8L18.9924 5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21.9924 9.80274C21.3257 9.40365 19.5924 9.08438 17.9924 11"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
