<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CrossProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
      animate: {
        rotate: 90,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
  x: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
      animate: {
        rotate: 45,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Cross', inheritAttrs: false })
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
        d="M14.5 7.5V5.5C14.5 5.03534 14.5 4.80302 14.4616 4.60982C14.3038 3.81644 13.6836 3.19624 12.8902 3.03843C12.697 3 12.4647 3 12 3C11.5353 3 11.303 3 11.1098 3.03843C10.3164 3.19624 9.69624 3.81644 9.53843 4.60982C9.5 4.80302 9.5 5.03534 9.5 5.5V7.5C9.5 8.44281 9.5 8.91421 9.20711 9.20711C8.91421 9.5 8.44281 9.5 7.5 9.5H5.5C5.03535 9.5 4.80302 9.5 4.60982 9.53843C3.81644 9.69624 3.19624 10.3164 3.03843 11.1098C3 11.303 3 11.5353 3 12C3 12.4647 3 12.697 3.03843 12.8902C3.19624 13.6836 3.81644 14.3038 4.60982 14.4616C4.80302 14.5 5.03534 14.5 5.5 14.5H7.49998C8.4428 14.5 8.91421 14.5 9.2071 14.7929C9.49999 15.0858 9.49999 15.5572 9.49998 16.5L9.49995 18.5C9.49995 18.9646 9.49995 19.197 9.53838 19.3902C9.69619 20.1836 10.3164 20.8037 11.1097 20.9616C11.303 21 11.5353 21 12 21C12.4647 21 12.697 21 12.8902 20.9616C13.6836 20.8038 14.3038 20.1836 14.4616 19.3902C14.5 19.197 14.5 18.9647 14.5 18.5V16.5C14.5 15.5572 14.5 15.0858 14.7929 14.7929C15.0858 14.5 15.5572 14.5 16.5 14.5H18.5C18.9647 14.5 19.197 14.5 19.3902 14.4616C20.1836 14.3038 20.8038 13.6836 20.9616 12.8902C21 12.697 21 12.4647 21 12C21 11.5353 21 11.303 20.9616 11.1098C20.8038 10.3164 20.1836 9.69624 19.3902 9.53843C19.197 9.5 18.9647 9.5 18.5 9.5H16.5C15.5572 9.5 15.0858 9.5 14.7929 9.20711C14.5 8.91421 14.5 8.44281 14.5 7.5Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
