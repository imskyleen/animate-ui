<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Loading03Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    ray1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.875,
        },
      },
    },
    ray2: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.75,
        },
      },
    },
    ray3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.625,
        },
      },
    },
    ray4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.5,
        },
      },
    },
    ray5: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.375,
        },
      },
    },
    ray6: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.25,
        },
      },
    },
    ray7: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.125,
        },
      },
    },
    ray8: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: 0.0,
        },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  spin: {
    ray1: {},
    ray2: {},
    ray3: {},
    ray4: {},
    ray5: {},
    ray6: {},
    ray7: {},
    ray8: {},
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Loading03', inheritAttrs: false })
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
        <motion.path
          d="M12 3V6"
          stroke-linecap="round"
          :variants="variants.ray1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M18.3635 5.63672L16.2422 7.75804"
          stroke-linecap="round"
          :variants="variants.ray2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M21 12L18 12"
          stroke-linecap="round"
          :variants="variants.ray3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M18.3635 18.3635L16.2422 16.2422"
          stroke-linecap="round"
          :variants="variants.ray4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 18V21"
          stroke-linecap="round"
          :variants="variants.ray5"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7.75804 16.2422L5.63672 18.3635"
          stroke-linecap="round"
          :variants="variants.ray6"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M6 12L3 12"
          stroke-linecap="round"
          :variants="variants.ray7"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7.75804 7.75804L5.63672 5.63672"
          stroke-linecap="round"
          :variants="variants.ray8"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
