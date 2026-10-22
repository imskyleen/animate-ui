<script setup lang="ts">
import { ref } from 'vue'
import { GitHubStarsButton, GitHubStarsButtonNumber } from '../../../v2/registry/vue/buttons/github-stars'

const repo = ref('animate-ui')
</script>

<template>
  <div class="flex flex-col items-start gap-6">
    <button type="button" @click="repo = 'other'">
      Switch repo
    </button>
    <GitHubStarsButton username="imskyleen" :repo="repo" in-view as-child>
      <a href="https://github.com/imskyleen/animate-ui">
        <GitHubStarsButtonNumber class="tabular-nums" />
      </a>
    </GitHubStarsButton>
  </div>
</template>
