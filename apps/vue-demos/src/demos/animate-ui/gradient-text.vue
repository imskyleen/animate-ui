<script setup lang="ts">
import { GradientText } from '@animate-ui/vue/primitives/texts/gradient'

withDefaults(defineProps<{ neon?: boolean | string }>(), { neon: false })
</script>

<template>
  <GradientText
    class="text-4xl font-semibold"
    text="Gradient Text"
    :neon="neon === true || neon === 'true'"
  />
</template>
