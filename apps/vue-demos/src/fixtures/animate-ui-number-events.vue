<script setup lang="ts">
import { SlidingNumber } from '@animate-ui/vue/primitives/texts/sliding-number'
import {
  ScrollingNumber,
  ScrollingNumberContainer,
  ScrollingNumberItems,
} from '@animate-ui/vue/primitives/texts/scrolling-number'
import { ref } from 'vue'

const last = ref<number | null>(null)
const completed = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <SlidingNumber :number="42" :from-number="0" @number-change="last = $event" />
    <ScrollingNumberContainer :number="300" :step="100" :items-size="40">
      <ScrollingNumber @completed="completed = true">
        <ScrollingNumberItems />
      </ScrollingNumber>
    </ScrollingNumberContainer>
    <output data-testid="sliding">{{ String(last) }}</output>
    <output data-testid="scrolling">{{ String(completed) }}</output>
  </div>
</template>
