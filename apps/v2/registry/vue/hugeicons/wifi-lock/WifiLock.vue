<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiLockProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lock: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    wave3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    lock: {},
    wave1: {
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
    wave2: {
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
    wave3: {
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
            delay: 0.4,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.4,
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

defineOptions({ name: 'WifiLock', inheritAttrs: false })
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
        d="M16.0803 20.8573L15.7761 21.5428L15.7761 21.5428L16.0803 20.8573ZM15.1332 19.8425L14.4337 20.113H14.4337L15.1332 19.8425ZM21.8668 19.8425L22.5663 20.113L22.5663 20.113L21.8668 19.8425ZM20.9197 20.8573L21.2239 21.5428L21.2239 21.5428L20.9197 20.8573ZM20.9197 15.5177L21.2239 14.8322V14.8322L20.9197 15.5177ZM21.8668 16.5325L22.5663 16.262L22.5663 16.262L21.8668 16.5325ZM16.0803 15.5177L15.7761 14.8322V14.8322L16.0803 15.5177ZM15.1332 16.5325L14.4337 16.262V16.262L15.1332 16.5325ZM16 15.375C16 15.7892 16.3358 16.125 16.75 16.125C17.1642 16.125 17.5 15.7892 17.5 15.375H16ZM19.5 15.375C19.5 15.7892 19.8358 16.125 20.25 16.125C20.6642 16.125 21 15.7892 21 15.375H19.5ZM17.625 16.125H19.375V14.625H17.625V16.125ZM19.375 20.25H17.625V21.75H19.375V20.25ZM17.625 20.25C17.2063 20.25 16.9325 20.2495 16.7222 20.2342C16.5196 20.2193 16.4338 20.1936 16.3845 20.1718L15.7761 21.5428C16.0484 21.6637 16.3272 21.7093 16.6128 21.7302C16.8905 21.7505 17.2283 21.75 17.625 21.75V20.25ZM14.25 18.1875C14.25 18.6147 14.2496 18.9702 14.2682 19.2611C14.2871 19.5577 14.3278 19.839 14.4337 20.113L15.8328 19.5721C15.8054 19.5014 15.7795 19.3921 15.7651 19.1658C15.7504 18.9336 15.75 18.6339 15.75 18.1875H14.25ZM16.3845 20.1718C16.1471 20.0664 15.9427 19.8566 15.8328 19.5721L14.4337 20.113C14.6789 20.7474 15.1559 21.2676 15.7761 21.5428L16.3845 20.1718ZM21.25 18.1875C21.25 18.6339 21.2496 18.9336 21.2349 19.1658C21.2205 19.3921 21.1946 19.5014 21.1672 19.5721L22.5663 20.113C22.6722 19.839 22.7129 19.5577 22.7318 19.2611C22.7504 18.9702 22.75 18.6147 22.75 18.1875H21.25ZM19.375 21.75C19.7717 21.75 20.1095 21.7505 20.3872 21.7302C20.6728 21.7093 20.9516 21.6637 21.2239 21.5428L20.6155 20.1718C20.5662 20.1936 20.4804 20.2193 20.2778 20.2342C20.0675 20.2495 19.7937 20.25 19.375 20.25V21.75ZM21.1672 19.5721C21.0573 19.8566 20.8529 20.0664 20.6155 20.1718L21.2239 21.5428C21.8441 21.2676 22.3211 20.7474 22.5663 20.113L21.1672 19.5721ZM19.375 16.125C19.7937 16.125 20.0675 16.1255 20.2778 16.1408C20.4804 16.1557 20.5662 16.1814 20.6155 16.2032L21.2239 14.8322C20.9516 14.7113 20.6728 14.6657 20.3872 14.6448C20.1095 14.6245 19.7717 14.625 19.375 14.625V16.125ZM22.75 18.1875C22.75 17.7603 22.7504 17.4048 22.7318 17.1139C22.7129 16.8173 22.6722 16.536 22.5663 16.262L21.1672 16.8029C21.1946 16.8736 21.2205 16.9829 21.2349 17.2092C21.2496 17.4414 21.25 17.7411 21.25 18.1875H22.75ZM20.6155 16.2032C20.8529 16.3086 21.0573 16.5184 21.1672 16.8029L22.5663 16.262C22.3211 15.6277 21.8441 15.1074 21.2239 14.8322L20.6155 16.2032ZM17.625 14.625C17.2283 14.625 16.8905 14.6245 16.6128 14.6448C16.3272 14.6657 16.0484 14.7113 15.7761 14.8322L16.3845 16.2032C16.4338 16.1814 16.5196 16.1557 16.7222 16.1408C16.9325 16.1255 17.2063 16.125 17.625 16.125V14.625ZM15.75 18.1875C15.75 17.7411 15.7504 17.4414 15.7651 17.2092C15.7795 16.9829 15.8054 16.8736 15.8328 16.8029L14.4337 16.262C14.3278 16.536 14.2871 16.8173 14.2682 17.1139C14.2496 17.4048 14.25 17.7603 14.25 18.1875H15.75ZM15.7761 14.8322C15.1559 15.1074 14.6789 15.6277 14.4337 16.262L15.8328 16.8029C15.9427 16.5184 16.1471 16.3086 16.3845 16.2032L15.7761 14.8322ZM17.5 15.375V13.6875H16V15.375H17.5ZM19.5 13.6875V15.375H21V13.6875H19.5ZM18.5 12.75C19.0782 12.75 19.5 13.1952 19.5 13.6875H21C21 12.3158 19.8548 11.25 18.5 11.25V12.75ZM17.5 13.6875C17.5 13.1952 17.9218 12.75 18.5 12.75V11.25C17.1452 11.25 16 12.3158 16 13.6875H17.5Z"
        fill="currentColor"
        :stroke-width="0.5"
        stroke-linejoin="round"
        :variants="variants.lock"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.5 15.5C9.76795 14.2321 11.4378 13.7679 13 14.1077"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5.5 12C8.67327 8.85033 12.1221 8.16715 15.5 10.0149"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 8C8.31579 2.66669 15.6842 2.66668 22 7.99989"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
