<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BookmarkPlusProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.82, 1.03, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    plus: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BookmarkPlus', inheritAttrs: false })
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
          d="M19 12V17.9808C19 20.2867 19 21.4396 18.2272 21.8523C16.7305 22.6514 13.9232 19.9852 12.59 19.1824C11.8168 18.7168 11.4302 18.484 11 18.484C10.5698 18.484 10.1832 18.7168 9.41 19.1824C8.0768 19.9852 5.26947 22.6514 3.77285 21.8523C3 21.4396 3 20.2867 3 17.9808V9.70753C3 6.07416 3 4.25748 4.17157 3.12874C5.34315 2 7.22876 2 11 2H12"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <motion.g
          :variants="variants.plus"
          initial="initial"
          :animate="controls"
        >
          <path
            d="M21 5.5H14"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.5 2V9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
