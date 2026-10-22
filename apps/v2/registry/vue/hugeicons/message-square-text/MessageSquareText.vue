<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MessageSquareTextProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 4, -4, 1, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {},
    path2: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0, 1],
        pathOffset: [0, 1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
    path3: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0, 1],
        pathOffset: [0, 1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  write: {
    group: {},
    path1: {},
    path2: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        pathOffset: [1, 0],
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
    path3: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        pathOffset: [1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MessageSquareText', inheritAttrs: false })
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
          d="M1.99609 10.5C1.99609 9.72921 2.00956 8.97679 2.03519 8.2503C2.11892 5.87683 2.16078 4.69009 3.12616 3.71745C4.09154 2.74481 5.31179 2.6926 7.75229 2.58819C9.09126 2.5309 10.517 2.5 11.9961 2.5C13.4752 2.5 14.9009 2.5309 16.2399 2.58819C18.6804 2.6926 19.9006 2.74481 20.866 3.71745C21.8314 4.69009 21.8733 5.87683 21.957 8.2503C21.9826 8.97679 21.9961 9.72921 21.9961 10.5C21.9961 11.2708 21.9826 12.0232 21.957 12.7497C21.8733 15.1232 21.8314 16.3099 20.866 17.2826C19.9006 18.2552 18.6804 18.3074 16.2398 18.4118C15.5059 18.4432 14.7459 18.4667 13.9654 18.4815C13.2242 18.4955 12.8537 18.5026 12.5281 18.6266C12.2025 18.7506 11.9285 18.9855 11.3806 19.4553L9.20113 21.3242C9.06882 21.4376 8.90029 21.5 8.726 21.5C8.32289 21.5 7.99609 21.1732 7.99609 20.7701V18.4219C7.91451 18.4186 7.83324 18.4153 7.75229 18.4118C5.31179 18.3074 4.09154 18.2552 3.12616 17.2825C2.16078 16.3099 2.11892 15.1232 2.03519 12.7497C2.00956 12.0232 1.99609 11.2708 1.99609 10.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M16.4961 8.5L7.49609 8.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12.9961 12.5L7.49609 12.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
