<script setup lang="ts">
import {
  GithubStars,
  GithubStarsIcon,
  GithubStarsLogo,
  GithubStarsNumber,
  GithubStarsParticles,
} from '@animate-ui/vue/primitives/github-stars'
import Star from './animate-ui-github-stars-star.vue'
</script>

<template>
  <GithubStars username="imskyleen" repo="animate-ui" class="flex items-center gap-2">
    <GithubStarsLogo class="size-6 text-muted-foreground" />
    <div class="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
      <GithubStarsNumber class="font-medium text-muted-foreground tabular-nums" />
      <GithubStarsParticles class="text-yellow-500">
        <GithubStarsIcon
          :icon="Star"
          class="size-[18px] fill-neutral-300 stroke-neutral-300 dark:fill-neutral-700 dark:stroke-neutral-700"
          color="var(--color-yellow-500)"
        />
      </GithubStarsParticles>
    </div>
  </GithubStars>
</template>
