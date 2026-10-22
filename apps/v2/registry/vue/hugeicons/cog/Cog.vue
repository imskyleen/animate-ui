<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CogProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180],
        transition: {
          duration: 1.25,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180, 270, 360],
        transition: {
          duration: 2.5,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: 'linear',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Cog', inheritAttrs: false })
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
          d="M19.995 12C19.995 7.58172 16.4132 4 11.995 4C7.5767 4 3.99498 7.58172 3.99498 12C3.99498 16.4182 7.5767 20 11.995 20C16.4132 20 19.995 16.4182 19.995 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M13.995 12C13.995 10.8954 13.0995 10 11.995 10C10.8904 10 9.99498 10.8954 9.99498 12C9.99498 13.1046 10.8904 14 11.995 14C13.0995 14 13.995 13.1046 13.995 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M11.995 2L11.995 4"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M11.995 22L11.995 20"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M17.0044 20.6577L16.0044 18.9256"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path5"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M10.9278 10.1435L7.00437 3.33718"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path6"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M20.6628 16.9955L18.9307 15.9955"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path7"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M3.34226 6.99554L5.07431 7.99554"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path8"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M13.995 11.9949L22 11.9949"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path9"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2.00003 11.9949L4.00003 11.9949"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path10"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M20.6577 6.99558L18.9257 7.99558"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path11"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M3.33724 16.9956L5.06929 15.9956"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path12"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M16.9957 3.33725L15.9957 5.0693"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path13"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M10.9967 13.7248L6.99566 20.6578"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path14"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
