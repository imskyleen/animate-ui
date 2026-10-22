<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MessageSquareDotProps = IconProps<keyof typeof animations>;

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
    path: {},
    circle: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -2, 0],
        y: [0, 2, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MessageSquareDot', inheritAttrs: false })
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
          d="M13.9654 2.51851C13.3219 2.50631 12.6645 2.5 11.9961 2.5C10.517 2.5 9.09126 2.5309 7.75229 2.58819C5.31179 2.6926 4.09154 2.74481 3.12616 3.71745C2.16078 4.69009 2.11892 5.87683 2.03519 8.2503C2.00956 8.97679 1.99609 9.72921 1.99609 10.5C1.99609 11.2708 2.00956 12.0232 2.03519 12.7497C2.11892 15.1232 2.16078 16.3099 3.12616 17.2825C4.09154 18.2552 5.31179 18.3074 7.75229 18.4118C7.83324 18.4153 7.91451 18.4186 7.99609 18.4219V20.7701C7.99609 21.1732 8.32289 21.5 8.726 21.5C8.90029 21.5 9.06882 21.4376 9.20113 21.3242L11.3806 19.4553C11.9285 18.9855 12.2025 18.7506 12.5281 18.6266C12.8537 18.5026 13.2242 18.4955 13.9654 18.4815C14.7459 18.4667 15.5059 18.4432 16.2398 18.4118C18.6804 18.3074 19.9006 18.2552 20.866 17.2826C21.8314 16.3099 21.8733 15.1232 21.957 12.7497C21.9826 12.0232 21.9961 11.2708 21.9961 10.5C21.9961 10.3324 21.9955 10.1657 21.9942 10"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M21.9961 5C21.9961 6.38071 20.8768 7.5 19.4961 7.5C18.1154 7.5 16.9961 6.38071 16.9961 5C16.9961 3.61929 18.1154 2.5 19.4961 2.5C20.8768 2.5 21.9961 3.61929 21.9961 5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.circle"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
