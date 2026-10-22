<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoonStarProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { rotate: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
      animate: {
        rotate: [0, -15, 8, -3, 0],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    group: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.6, 1.2, 1],
        opacity: [1, 0.5, 1, 1],
        transition: {
          duration: 0.9,
          ease: 'easeInOut',
          times: [0, 0.35, 0.7, 1],
        },
      },
    },
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  spin: {
    path1: {
      initial: { rotate: 0, transition: { duration: 0 } },
      animate: {
        rotate: [0, -30, 400, 360],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.75, 1],
          ease: ['easeInOut', 'easeInOut', 'easeInOut'],
        },
      },
    },
    group: {
      initial: { scale: 1, rotate: 0, y: 0, x: 0 },
      animate: {
        scale: [1, 0, 0, 1],
        rotate: [0, 90, 90, 0],
        y: [0, 6, 10, 0],
        x: [0, -10, -6, 0],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.25, 0.65, 1],
        },
      },
    },
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MoonStar', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M21.2422 14.3284C20.0425 14.9689 18.6723 15.3321 17.2173 15.3321C12.4913 15.3321 8.66011 11.5009 8.66011 6.77485C8.66011 5.31986 9.02324 3.94968 9.66382 2.75C5.40984 3.74698 2.24219 7.56513 2.24219 12.1231C2.24219 17.4399 6.55229 21.75 11.8691 21.75C16.4271 21.75 20.2452 18.5824 21.2422 14.3284Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.7422 2.25L18.037 3.0466C18.4235 4.09117 18.6167 4.61345 18.9977 4.99445C19.3787 5.37545 19.901 5.56871 20.9456 5.95523L21.7422 6.25L20.9456 6.54477C19.901 6.93129 19.3787 7.12455 18.9977 7.50555C18.6167 7.88655 18.4235 8.40883 18.037 9.4534L17.7422 10.25L17.4474 9.4534C17.0609 8.40883 16.8676 7.88655 16.4866 7.50555C16.1056 7.12455 15.5834 6.93129 14.5388 6.54477L13.7422 6.25L14.5388 5.95523C15.5834 5.56871 16.1056 5.37545 16.4866 4.99445C16.8676 4.61345 17.0609 4.09117 17.4474 3.0466L17.7422 2.25Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
