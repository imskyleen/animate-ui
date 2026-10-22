<script setup lang="ts">
import { ShimmeringText } from '@animate-ui/vue/primitives/texts/shimmering'

withDefaults(
  defineProps<{ wave?: boolean | string, duration?: number | string }>(),
  { wave: false, duration: 1 },
)
</script>

<template>
  <ShimmeringText
    :key="`${wave}-${duration}`"
    class="text-4xl font-semibold"
    text="Shimmering Text"
    :wave="wave === true || wave === 'true'"
    :duration="Number(duration)"
  />
</template>
