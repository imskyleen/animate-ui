<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ArrowLeftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: '-25%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-25%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group: {},
    path1: {
      initial: {
        d: 'M19 12H5',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M19 12H10',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: 'm12 19-7-7 7-7',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'm15.5 19-7-7 7-7',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group: {},
    path1: {
      initial: {
        d: 'M19 12H5',
      },
      animate: {
        d: ['M19 12H5', 'M19 12H10', 'M19 12H5'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: 'm12 19-7-7 7-7',
      },
      animate: {
        d: ['m12 19-7-7 7-7', 'm15.5 19-7-7 7-7', 'm12 19-7-7 7-7'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-150%', '150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ArrowLeft', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M19 12H5"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="m12 19-7-7 7-7"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
