<script setup lang="ts">
import { MorphingText } from '@animate-ui/vue/primitives/texts/morphing'

withDefaults(
  defineProps<{ loop?: boolean | string, holdDelay?: number | string }>(),
  { loop: true, holdDelay: 2500 },
)

const texts = [
  'MorphingText Primitive',
  'Animate your text 🚀',
  'Handles emojis 🚀✨',
  'Built with Motion ✨',
]
</script>

<template>
  <MorphingText
    :key="`${loop}-${holdDelay}`"
    class="max-w-2xl text-4xl font-semibold"
    :text="texts"
    :loop="loop === true || loop === 'true'"
    :hold-delay="Number(holdDelay)"
  />
</template>
