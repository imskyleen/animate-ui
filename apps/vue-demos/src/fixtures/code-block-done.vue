<script setup lang="ts">
import { CodeBlock } from '@animate-ui/vue/primitives/code-block'
import { ref } from 'vue'

const done = ref(0)
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <output data-testid="done">{{ done }}</output>
    <CodeBlock code="const a = 1;" lang="tsx" in-view @done="done++" />
  </div>
</template>
