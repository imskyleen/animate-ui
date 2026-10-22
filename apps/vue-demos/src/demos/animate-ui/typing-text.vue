<script setup lang="ts">
import { TypingText, TypingTextCursor } from '@animate-ui/vue/primitives/texts/typing'

withDefaults(
  defineProps<{
    delay?: number | string
    holdDelay?: number | string
    loop?: boolean | string
    cursor?: boolean | string
  }>(),
  { delay: 0, holdDelay: 1000, loop: false, cursor: true },
)
</script>

<template>
  <TypingText
    :key="`${delay}-${holdDelay}-${loop}-${cursor}`"
    class="text-4xl font-semibold"
    text="Typing Text component made with Motion. Highly customizable and easy to use."
    :delay="Number(delay)"
    :hold-delay="Number(holdDelay)"
    :loop="loop === true || loop === 'true'"
  >
    <TypingTextCursor
      v-if="cursor === true || cursor === 'true'"
      class="ml-1 h-8! w-1! rounded-full"
    />
  </TypingText>
</template>
