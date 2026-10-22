<script setup lang="ts">
import {
  GitHubStarsButton,
  GitHubStarsButtonIcon,
  GitHubStarsButtonLogo,
  GitHubStarsButtonNumber,
  GitHubStarsButtonParticles,
} from '../../../v2/registry/vue/buttons/github-stars'
import Star from './animate-ui-github-stars-button-star.vue'
</script>

<template>
  <GitHubStarsButton
    username="imskyleen"
    repo="animate-ui"
    as-child
    class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
  >
    <a
      href="https://github.com/imskyleen/animate-ui"
      target="_blank"
      rel="noreferrer noopener"
    >
      <GitHubStarsButtonLogo class="size-4" />
      <GitHubStarsButtonNumber class="tabular-nums" />
      <GitHubStarsButtonParticles class="text-yellow-500">
        <GitHubStarsButtonIcon
          :icon="Star"
          class="size-[18px] fill-neutral-700 stroke-neutral-700"
          color="var(--color-yellow-500)"
        />
      </GitHubStarsButtonParticles>
    </a>
  </GitHubStarsButton>
</template>
