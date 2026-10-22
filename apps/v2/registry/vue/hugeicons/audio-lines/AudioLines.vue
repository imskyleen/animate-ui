<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AudioLinesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { d: 'M4 11V13' },
      animate: {
        d: [
          'M4 11V13',
          'M4 7.66667V16.3333',
          'M4 9.66667V14.3333',
          'M4 8.33333V15.6667',
          'M4 11V13',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line2: {
      initial: { d: 'M8 7V17' },
      animate: {
        d: ['M8 7V17', 'M8 3V21', 'M8 10.6364V13.3636', 'M8 7V17'],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line3: {
      initial: { d: 'M12 3V21' },
      animate: {
        d: ['M12 3V21', 'M12 6.5V17.5', 'M12 3V21', 'M12 8.5V15.5', 'M12 3V21'],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line4: {
      initial: { d: 'M16 7V17' },
      animate: {
        d: [
          'M16 7V17',
          'M16 3V21',
          'M16 5.57143V18.4286',
          'M16 3V21',
          'M16 7V17',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
    line5: {
      initial: { d: 'M20 11V13' },
      animate: {
        d: [
          'M20 11V13',
          'M20 11.7692V12.2308',
          'M20 10.8461V13.1539',
          'M20 11.4615V12.5385',
          'M20 11V13',
        ],
        transition: { duration: 1.5, ease: 'linear', repeat: Infinity },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AudioLines', inheritAttrs: false })
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
        d="M4 11V13"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 7V17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 3V21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 7V17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20 11V13"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
