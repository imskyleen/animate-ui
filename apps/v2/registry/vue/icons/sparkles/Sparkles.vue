<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SparklesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {},
    plus: {
      initial: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 0.7, 1.2, 1],
        rotate: [0, 90],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.15 },
      },
    },
    circle: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.2, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {},
    plus: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.15,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.15,
          },
        },
      },
    },
    circle: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 0.9, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {
      initial: {
        fill: 'currentColor',
        fillOpacity: 0,
      },
      animate: {
        fillOpacity: 1,
        transition: { delay: 0.2 },
      },
    },
    plus: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.15,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.15,
          },
        },
      },
    },
    circle: {
      initial: {
        fill: 'currentColor',
        fillOpacity: 0,
        opacity: 1,
        scale: 1,
      },
      animate: {
        fillOpacity: 1,
        opacity: 0,
        scale: 0,
        transition: {
          fillOpacity: { delay: 0.2 },
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Sparkles', inheritAttrs: false })
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
          d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M20 2v4 M22 4h-4"
        :variants="variants.plus"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="4"
        cy="20"
        r="2"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
