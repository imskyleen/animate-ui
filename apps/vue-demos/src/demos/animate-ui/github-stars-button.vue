<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
  type githubStarsButtonVariants,
} from '../../../../v2/registry/vue/buttons/github-stars'
import Star from './github-stars-star.vue'

type Variants = VariantProps<typeof githubStarsButtonVariants>

const starVariants = cva('size-[18px]', {
  variants: {
    variant: {
      default:
        'fill-neutral-700 stroke-neutral-700 dark:fill-neutral-300 dark:stroke-neutral-300',
      accent:
        'fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700',
      outline:
        'fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700',
      ghost:
        'fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

withDefaults(defineProps<{ variant?: Variants['variant'], size?: Variants['size'] }>(), {
  variant: 'default',
  size: 'default',
})
</script>

<template>
  <GitHubStarsButton
    username="imskyleen"
    repo="animate-ui"
    :value="3200"
    as-child
    :variant="variant"
    :size="size"
  >
    <a
      href="https://github.com/imskyleen/animate-ui"
      target="_blank"
      rel="noreferrer noopener"
    >
      <GitHubStarsButtonLogo />
      <GitHubStarsButtonNumber class="tabular-nums" />
      <GitHubStarsButtonParticles class="text-yellow-500">
        <GitHubStarsButtonIcon
          :icon="Star"
          :class="starVariants({ variant })"
          color="var(--color-yellow-500)"
        />
      </GitHubStarsButtonParticles>
    </a>
  </GitHubStarsButton>
</template>
