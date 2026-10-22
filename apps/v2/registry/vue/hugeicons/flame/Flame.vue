<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FlameProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    flame: {
      initial: { scaleY: 1, skewX: 0, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 1.05, 0.95, 1.03, 1],
        skewX: [0, 3, -3, 1.5, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    heart: {
      initial: { scaleY: 1, skewX: 0, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 1.05, 0.95, 1.03, 1],
        skewX: [0, 3, -3, 1.5, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Flame', inheritAttrs: false })
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
        d="M12 21.25C16.1421 21.25 19.5 17.8669 19.5 13.6935C19.5 12.8913 19.5 12.089 19.2756 11.0606C19.1017 10.2635 19.0147 9.86498 18.7651 9.64636C18.5475 9.45581 18.3598 9.38913 18.0717 9.39998C17.7412 9.41242 17.1956 9.85347 16.1046 10.7356C16.0227 10.8018 15.9817 10.8349 15.7137 10.8321C15.5671 10.8306 15.2736 10.7004 15.1735 10.5925C14.9905 10.3952 14.9807 10.2443 14.9611 9.94242C14.7677 6.95746 13.8802 5.00687 12.9275 3.77389C12.393 3.08206 12.1257 2.73615 11.6196 2.75042C11.1135 2.7647 10.7283 3.32541 9.9578 4.44682C8.04184 7.23538 4.5 8.84241 4.5 13.6935C4.5 17.8669 7.85786 21.25 12 21.25Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.flame"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 17.432C16 19.5407 14.2091 21.2501 12 21.2501C9.79086 21.2501 8 19.5407 8 17.432C8 16.3392 9.07446 14.8337 10.1096 13.6368C10.9149 12.7058 11.3175 12.2402 12 12.2402C12.6825 12.2402 13.0851 12.7058 13.8904 13.6368C14.9255 14.8337 16 16.3392 16 17.432Z"
        :variants="variants.heart"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
