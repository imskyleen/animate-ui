<script setup lang="ts">
import { ref } from 'vue'

const on = ref(false)
</script>

<template>
  <slot :on="on" />
  <button data-testid="toggle" class="absolute right-0 bottom-0 z-50" @click="on = !on">
    Toggle
  </button>
</template>
