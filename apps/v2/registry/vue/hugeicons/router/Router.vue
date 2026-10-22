<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RouterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 },
      },
    },
    path3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25, 1, 0.25, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0.25, 1, 0.25, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
  blink: {
    rect: {},
    path1: {
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
    path2: {
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
            delay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
        },
      },
    },
    path3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0, 1, 0, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [0, 1, 0, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Router', inheritAttrs: false })
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
        d="M17.5 22H6.5C4.62513 22 3.6877 22 3.03054 21.4695C2.8183 21.2982 2.63166 21.0908 2.47746 20.855C2 20.1248 2 19.0832 2 17C2 14.9168 2 13.8752 2.47746 13.145C2.63166 12.9092 2.8183 12.7018 3.03054 12.5305C3.6877 12 4.62513 12 6.5 12H17.5C19.3749 12 20.3123 12 20.9695 12.5305C21.1817 12.7018 21.3683 12.9092 21.5225 13.145C22 13.8752 22 14.9168 22 17C22 19.0832 22 20.1248 21.5225 20.855C21.3683 21.0908 21.1817 21.2982 20.9695 21.4695C20.3123 22 19.3749 22 17.5 22Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.5496 9.75039C12.9638 9.75039 13.2996 9.41461 13.2996 9.00039C13.2996 8.58618 12.9638 8.25039 12.5496 8.25039V9.00039V9.75039Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.4996 8.25039C12.0854 8.25039 11.7496 8.58618 11.7496 9.00039C11.7496 9.41461 12.0854 9.75039 12.4996 9.75039V9.00039V8.25039Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.5996 9.00039H11.8496C11.8496 8.64141 12.1406 8.35039 12.4996 8.35039V9.10039V9.85039C12.969 9.85039 13.3496 9.46984 13.3496 9.00039H12.5996Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.4996 9.10039V8.35039C12.8586 8.35039 13.1496 8.64141 13.1496 9.00039H12.3996H11.6496C11.6496 9.46984 12.0302 9.85039 12.4996 9.85039V9.10039Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.3996 9.00039H13.1496C13.1496 9.35938 12.8586 9.65039 12.4996 9.65039V8.90039V8.15039C12.0302 8.15039 11.6496 8.53095 11.6496 9.00039H12.3996Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.4996 8.90039V9.65039C12.1406 9.65039 11.8496 9.35938 11.8496 9.00039H12.5996H13.3496C13.3496 8.53095 12.969 8.15039 12.4996 8.15039V8.90039Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M12.5496 9.00039V8.25039H12.4996V9.00039V9.75039H12.5496V9.00039Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
      />
      <path
        d="M6 17H10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.g
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M9.70761 5.7897C9.42153 6.08925 9.43245 6.564 9.73201 6.85008C10.0316 7.13616 10.5063 7.12524 10.7924 6.82569L10.25 6.30769L9.70761 5.7897Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M14.2076 6.82569C14.4937 7.12524 14.9684 7.13616 15.268 6.85008C15.5675 6.564 15.5785 6.08925 15.2924 5.7897L14.75 6.30769L14.2076 6.82569Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M12.5 5.33182V4.58182C11.4028 4.58182 10.4153 5.04873 9.70761 5.7897L10.25 6.30769L10.7924 6.82569C11.2364 6.36077 11.8398 6.08182 12.5 6.08182V5.33182Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M14.75 6.30769L15.2924 5.7897C14.5847 5.04873 13.5972 4.58182 12.5 4.58182V5.33182V6.08182C13.1602 6.08182 13.7636 6.36077 14.2076 6.82569L14.75 6.30769Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.g
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M16.4576 4.46973C16.7437 4.76928 17.2184 4.7802 17.518 4.49412C17.8175 4.20804 17.8285 3.7333 17.5424 3.43374L17 3.95174L16.4576 4.46973Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M7.45761 3.43374C7.17153 3.7333 7.18245 4.20804 7.48201 4.49412C7.78156 4.7802 8.25631 4.76928 8.54239 4.46973L8 3.95174L7.45761 3.43374Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M17 3.95174L17.5424 3.43374C16.2589 2.08984 14.4759 1.25 12.5 1.25V2V2.75C14.0388 2.75 15.4378 3.40187 16.4576 4.46973L17 3.95174Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
        <path
          d="M12.5 2V1.25C10.5241 1.25 8.74108 2.08984 7.45761 3.43374L8 3.95174L8.54239 4.46973C9.56222 3.40187 10.9612 2.75 12.5 2.75V2Z"
          fill="currentColor"
          :stroke-width="0.5"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.g
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M14.125 17H14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.25 17C14.25 17.1381 14.1381 17.25 14 17.25C13.8619 17.25 13.75 17.1381 13.75 17C13.75 16.8619 13.8619 16.75 14 16.75C14.1381 16.75 14.25 16.8619 14.25 17Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.g
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M18.125 17H18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.25 17C18.25 17.1381 18.1381 17.25 18 17.25C17.8619 17.25 17.75 17.1381 17.75 17C17.75 16.8619 17.8619 16.75 18 16.75C18.1381 16.75 18.25 16.8619 18.25 17Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
