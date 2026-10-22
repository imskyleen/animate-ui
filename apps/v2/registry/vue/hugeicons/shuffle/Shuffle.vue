<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ShuffleProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transition: { duration: 0 } },
      animate: {
        scaleY: [1, -1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Shuffle', inheritAttrs: false })
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
          d="M19.5576 4L20.4551 4.97574C20.8561 5.41165 21.0566 5.62961 20.9861 5.81481C20.9155 6 20.632 6 20.0649 6C18.7956 6 17.2771 5.79493 16.1111 6.4733C15.3903 6.89272 14.8883 7.62517 14.0392 9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3 18H4.58082C6.50873 18 7.47269 18 8.2862 17.5267C9.00708 17.1073 9.50904 16.3748 10.3582 15"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.5576 20L20.4551 19.0243C20.8561 18.5883 21.0566 18.3704 20.9861 18.1852C20.9155 18 20.632 18 20.0649 18C18.7956 18 17.2771 18.2051 16.1111 17.5267C15.2976 17.0534 14.7629 16.1815 13.6935 14.4376L10.7038 9.5624C9.63441 7.81853 9.0997 6.9466 8.2862 6.4733C7.47269 6 6.50873 6 4.58082 6H3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
