<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LockKeyholeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [1, 0.8, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  unlock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: 0.8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LockKeyhole', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.circle
          :cx="11.9964"
          :cy="15.5"
          :r="2"
          :variants="variants.circle"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M13.4958 9H10.4964C8.16158 9 6.99417 9 6.11049 9.47237C5.41275 9.84535 4.84128 10.4169 4.46837 11.1146C3.99608 11.9984 3.99619 13.1658 3.99641 15.5006C3.99662 17.835 3.99673 19.0023 4.46907 19.8858C4.84203 20.5835 5.41347 21.1548 6.11115 21.5277C6.99475 22 8.16197 22 10.4964 22H13.4958C15.8304 22 16.9978 22 17.8814 21.5277C18.5791 21.1548 19.1506 20.5833 19.5235 19.8856C19.9958 19.0019 19.9958 17.8346 19.9958 15.5C19.9958 13.1654 19.9958 11.9981 19.5235 11.1144C19.1506 10.4167 18.5791 9.84525 17.8814 9.47231C16.9978 9 15.8304 9 13.4958 9Z"
          stroke-linecap="round"
          :variants="variants.rect"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7.4964 9L7.4964 6.5C7.4964 4.01472 9.51112 2 11.9964 2C14.4817 2 16.4964 4.01472 16.4964 6.5L16.4964 9"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
