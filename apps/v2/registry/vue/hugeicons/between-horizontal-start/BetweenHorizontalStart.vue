<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BetweenHorizontalStartProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    topRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    bottomRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    topRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    bottomRect: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BetweenHorizontalStart', inheritAttrs: false })
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
        d="M18.5 3H11.5C10.5694 3 10.104 3 9.72746 3.12236C8.96636 3.36965 8.36965 3.96636 8.12236 4.72746C8 5.10404 8 5.56936 8 6.5C8 7.43064 8 7.89596 8.12236 8.27254C8.36965 9.03364 8.96636 9.63035 9.72746 9.87764C10.104 10 10.5694 10 11.5 10H18.5C19.4306 10 19.896 10 20.2725 9.87764C21.0336 9.63035 21.6303 9.03364 21.8776 8.27254C22 7.89596 22 7.43064 22 6.5C22 5.56936 22 5.10404 21.8776 4.72746C21.6303 3.96636 21.0336 3.36965 20.2725 3.12236C19.896 3 19.4306 3 18.5 3Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.topRect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 9C2 9 5.00001 11.2094 5 12C4.99999 12.7905 2.00002 15 2.00002 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.5 14H11.5C10.5694 14 10.104 14 9.72746 14.1224C8.96636 14.3697 8.36965 14.9664 8.12236 15.7275C8 16.104 8 16.5694 8 17.5C8 18.4306 8 18.896 8.12236 19.2725C8.36965 20.0336 8.96636 20.6303 9.72746 20.8776C10.104 21 10.5694 21 11.5 21H18.5C19.4306 21 19.896 21 20.2725 20.8776C21.0336 20.6303 21.6303 20.0336 21.8776 19.2725C22 18.896 22 18.4306 22 17.5C22 16.5694 22 16.104 21.8776 15.7275C21.6303 14.9664 21.0336 14.3697 20.2725 14.1224C19.896 14 19.4306 14 18.5 14Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.bottomRect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
