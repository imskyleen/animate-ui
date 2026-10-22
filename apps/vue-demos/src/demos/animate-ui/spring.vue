<script setup lang="ts">
import { Spring, SpringElement, SpringProvider } from '@animate-ui/vue/primitives/spring'
</script>

<template>
  <SpringProvider>
    <Spring class="z-10 text-muted-foreground" />
    <SpringElement class="relative z-20">
      <div
        aria-label="Drag me"
        class="flex size-14 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-md select-none"
      >
        Drag
      </div>
    </SpringElement>
  </SpringProvider>
</template>
