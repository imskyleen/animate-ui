<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PlaneTakeoffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    plane: {
      initial: { y: 0, rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        y: [0, -1, 0],
        rotate: [0, -5, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PlaneTakeoff', inheritAttrs: false })
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
      <path
        d="M20.4922 19.5H3.99219"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M7.71721 10.7095C8.17124 10.452 8.39826 10.3233 8.51061 10.1826C8.78548 9.83824 8.79282 9.34147 8.52829 8.98626C8.42016 8.84107 8.20287 8.70686 7.76829 8.43844L5.94973 7.31521C5.83475 7.2442 5.77727 7.2087 5.73942 7.17957C5.23883 6.79429 5.23903 6.01824 5.73981 5.63751C5.77767 5.60872 5.83518 5.57374 5.95018 5.50377C6.10914 5.40706 6.18862 5.35871 6.26699 5.31516C7.2378 4.77574 8.36416 4.61494 9.44248 4.8618C9.52954 4.88173 9.61894 4.90597 9.79776 4.95446L13.9264 6.07387C14.5382 6.23975 14.8441 6.32269 15.1506 6.29928C15.2099 6.29475 15.2688 6.28727 15.3274 6.27685C15.6302 6.22295 15.9069 6.06609 16.4602 5.75238L17.7574 5.01689C18.0356 4.85912 18.1748 4.78024 18.3066 4.72294C19.2496 4.3131 20.3358 4.47623 21.1319 5.14725C21.2432 5.24106 21.3558 5.35774 21.5809 5.59111C21.7061 5.72086 21.7687 5.78574 21.8096 5.84299C22.1102 6.26343 22.0316 6.85459 21.6329 7.17222C21.5786 7.21547 21.5015 7.25981 21.3473 7.34849L9.63351 14.085C7.86837 15.1002 6.9858 15.6077 6.07562 15.4808C5.99037 15.469 5.90569 15.453 5.82184 15.4329C4.92661 15.219 4.26841 14.4207 2.95201 12.8239L2.40113 12.1557C2.23338 11.9522 2.14951 11.8505 2.10199 11.7584C1.88821 11.3442 1.99436 10.8317 2.35285 10.5472C2.43253 10.484 2.54914 10.4277 2.78235 10.3151C3.00135 10.2094 3.11085 10.1565 3.21864 10.1204C3.69094 9.96191 4.20567 10.0075 4.64672 10.2469C4.74737 10.3016 4.84711 10.373 5.04658 10.5158L5.12834 10.5744C5.4272 10.7884 5.57663 10.8953 5.73056 10.9672C6.15275 11.1644 6.63024 11.1907 7.06885 11.041C7.22877 10.9864 7.39158 10.8941 7.71721 10.7095Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.plane"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
