<script setup lang="ts">
import { RepeatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Fades } from '@animate-ui/vue/primitives/effects/fade'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string,
    initialOpacity?: number | string,
    opacity?: number | string
  }>(),
  { delay: 0, initialOpacity: 0, opacity: 1 },
)

const ITEMS = ['Design', 'Build', 'Ship']
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div :key="`${run}-${delay}-${initialOpacity}-${opacity}`" class="flex gap-3">
      <Fades
        :hold-delay="100"
          :delay="Number(delay)"
          :initial-opacity="Number(initialOpacity)"
          :opacity="Number(opacity)"
      >
        <div
          v-for="item in ITEMS"
          :key="item"
          class="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
        >
          {{ item }}
        </div>
      </Fades>
    </div>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RepeatIcon" :stroke-width="2" />
      Replay
    </Button>
  </div>
</template>
