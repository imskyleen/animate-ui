<script setup lang="ts">
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import Group from './provider-avatar-group-tempo-group.vue'
</script>

<template>
  <div class="flex gap-40 p-40">
    <Group label="Default" />
    <AnimateUIProvider :tempo="2">
      <Group label="Slow" />
    </AnimateUIProvider>
  </div>
</template>
