<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MessageSquareMoreProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
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
    path: {},
    line1: {},
    line2: {},
    line3: {},
    dot1: {
      initial: { d: 'M16.1211 10.5L15.9961 10.5' },
      animate: {
        d: [
          'M16.1211 10.5L15.9961 10.5',
          'M15.9961 9L15.9961 12',
          'M16.1211 10.5L15.9961 10.5',
        ],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.2 },
      },
    },
    dot2: {
      initial: { d: 'M12.1218 10.5L11.9968 10.5' },
      animate: {
        d: [
          'M12.1218 10.5L11.9968 10.5',
          'M11.9968 9L11.9968 12',
          'M12.1218 10.5L11.9968 10.5',
        ],
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.1 },
      },
    },
    dot3: {
      initial: { d: 'M8.12109 10.5L7.99609 10.5' },
      animate: {
        d: [
          'M8.12109 10.5L7.99609 10.5',
          'M7.99609 9L7.99609 12',
          'M8.12109 10.5L7.99609 10.5',
        ],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    path: {},
    line1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, delay: 0.4, ease: 'easeInOut' },
      },
    },
    line2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, delay: 0.2, ease: 'easeInOut' },
      },
    },
    line3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    dot1: {},
    dot2: {},
    dot3: {},
  } satisfies Record<string, Variants>,
  jump: {
    group: {},
    path: {},
    line1: {
      initial: { y: 0 },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    line2: {
      initial: { y: 0 },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.2,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    line3: {
      initial: { y: 0 },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    dot1: {},
    dot2: {},
    dot3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MessageSquareMore', inheritAttrs: false })
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
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
        <motion.g
          :variants="variants.line1"
          initial="initial"
          :animate="controls"
        >
          <motion.path
            d="M16.1211 10.5L15.9961 10.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.dot1"
            initial="initial"
            :animate="controls"
          />
          <path
            d="M16.2461 10.5C16.2461 10.6381 16.1342 10.75 15.9961 10.75C15.858 10.75 15.7461 10.6381 15.7461 10.5C15.7461 10.3619 15.858 10.25 15.9961 10.25C16.1342 10.25 16.2461 10.3619 16.2461 10.5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
        <motion.g
          :variants="variants.line2"
          initial="initial"
          :animate="controls"
        >
          <motion.path
            d="M12.1218 10.5L11.9968 10.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.dot2"
            initial="initial"
            :animate="controls"
          />
          <path
            d="M12.2468 10.5C12.2468 10.6381 12.1349 10.75 11.9968 10.75C11.8588 10.75 11.7468 10.6381 11.7468 10.5C11.7468 10.3619 11.8588 10.25 11.9968 10.25C12.1349 10.25 12.2468 10.3619 12.2468 10.5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
        <motion.g
          :variants="variants.line3"
          initial="initial"
          :animate="controls"
        >
          <motion.path
            d="M8.12109 10.5L7.99609 10.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.dot3"
            initial="initial"
            :animate="controls"
          />
          <path
            d="M8.24609 10.5C8.24609 10.6381 8.13416 10.75 7.99609 10.75C7.85802 10.75 7.74609 10.6381 7.74609 10.5C7.74609 10.3619 7.85802 10.25 7.99609 10.25C8.13416 10.25 8.24609 10.3619 8.24609 10.5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
