<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PlugZapProps = IconProps<keyof typeof animations>;

const PLUG: Variants = {
  initial: { x: 0, y: 0 },
  animate: {
    x: [0, 1.2, 1.2, 0],
    y: [0, -1.2, -1.2, 0],
    transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.3, 0.55, 1] },
  },
};

export const animations = {
  default: {
    path1: PLUG,
    path2: PLUG,
    path3: PLUG,
    path4: PLUG,
    path5: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.5, 1, 0.7, 1],
        scale: [1, 1.2, 0.95, 1.08, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
  flicker: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
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

defineOptions({ name: 'PlugZap', inheritAttrs: false })
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
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M14.4716 16.8006L7.19135 9.52039"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.71255 10.0399L6.15251 11.6C5.32501 12.4275 4.86013 13.5498 4.86013 14.72C4.86013 14.8523 4.80343 14.9876 4.70894 15.1227C4.03073 16.0921 3.71818 17.2257 4.55476 18.0623L5.93031 19.4378C6.76675 20.2743 7.90038 19.9622 8.86953 19.2839C9.00474 19.1893 9.14021 19.1325 9.2726 19.1325C10.4429 19.1325 11.5652 18.6676 12.3927 17.8401L13.9527 16.2801L7.71255 10.0399Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.path
        d="M2.99237 21.0002L4.99219 18.9999"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.49219 11.4999L11.9922 8.99988"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.4922 14.4999L14.9922 11.9999"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.9922 2.99988L17.4072 4.84909C16.7965 5.56152 16.4912 5.91773 16.625 6.20881C16.7589 6.49988 17.2281 6.49988 18.1664 6.49988H18.5398C19.5813 6.49988 20.1021 6.49988 20.229 6.81109C20.3559 7.12229 19.9836 7.48644 19.2391 8.21474L17.4141 9.99988"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
