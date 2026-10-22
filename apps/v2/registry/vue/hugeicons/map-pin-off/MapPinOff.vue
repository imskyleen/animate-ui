<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MapPinOffProps = IconProps<keyof typeof animations>;

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
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {
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
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MapPinOff', inheritAttrs: false })
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
        d="M11.497 7.53544C11.6603 7.51209 11.8272 7.5 11.997 7.5C13.93 7.5 15.497 9.067 15.497 11C15.497 11.1698 15.4849 11.3367 15.4616 11.5"
        stroke-linecap="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.497 17.6461C16.2646 18.9628 14.8733 20.1884 13.6148 21.367C13.1811 21.773 12.6014 22 11.9981 22C11.3949 22 10.8152 21.773 10.3815 21.367C6.41003 17.626 1.08777 13.4469 3.68328 7.37966C4.01768 6.59797 4.46367 5.63512 4.99701 5"
        stroke-linecap="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M1.99701 2L21.997 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.99701 3.48631C8.46615 2.53477 10.21 2 11.9981 2C15.5409 2 18.9096 4.09916 20.313 7.37966C21.6573 10.5221 20.8766 13.1643 19.2582 15.5"
        stroke-linecap="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.99701 9C8.66226 9.53668 8.49701 10.3209 8.49701 11C8.49701 12.933 10.064 14.5 11.997 14.5C12.6568 14.5 13.4702 14.3174 13.997 14"
        stroke-linecap="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
