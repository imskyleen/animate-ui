<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SmartphoneProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    phone: {},
    home: {},
    app1: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.04, 0.14, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    app2: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.13, 0.23, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    app3: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.22, 0.32, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    app4: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.31, 0.41, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    app5: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.4, 0.5, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
    app6: {
      initial: { opacity: 0 },
      animate: {
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.49, 0.59, 0.8, 1],
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

defineOptions({ name: 'Smartphone', inheritAttrs: false })
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
      v-bind="attrs"
    >
      <motion.rect
        width="14"
        height="20"
        x="5"
        y="2"
        rx="2"
        ry="2"
        :variants="variants.phone"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 18h.01"
        :variants="variants.home"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="7.4"
        y="5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="10.9"
        y="5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app2"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="14.4"
        y="5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app3"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="7.4"
        y="8.5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app4"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="10.9"
        y="8.5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app5"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="14.4"
        y="8.5"
        width="2.2"
        height="2.2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        :variants="variants.app6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
