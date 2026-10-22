<script setup lang="ts">
import type { SlidingTextDirection, SlidingTextTrigger } from '@animate-ui/vue/primitives/texts/sliding'
import { SlidingText } from '@animate-ui/vue/primitives/texts/sliding'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{ direction?: SlidingTextDirection, trigger?: SlidingTextTrigger }>(),
  { direction: 'down', trigger: 'hover' },
)
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <SlidingText
      :key="`${direction}-${trigger}`"
      :direction="direction"
      :trigger="trigger"
      class="cursor-pointer text-4xl font-semibold"
      text="Sliding Text"
    />
    <Button as-child size="lg">
      <a href="#" @click.prevent>
        <SlidingText
          :key="`link-${direction}-${trigger}`"
          :direction="direction"
          :trigger="trigger"
          text="Get started"
        />
      </a>
    </Button>
  </div>
</template>
