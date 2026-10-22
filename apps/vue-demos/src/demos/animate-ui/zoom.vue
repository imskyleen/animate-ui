<script setup lang="ts">
import { RepeatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Zooms } from '@animate-ui/vue/primitives/effects/zoom'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string,
    initialScale?: number | string,
    scale?: number | string
  }>(),
  { delay: 0, initialScale: 0.5, scale: 1 },
)

const ITEMS = ['Design', 'Build', 'Ship']
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div :key="`${run}-${delay}-${initialScale}-${scale}`" class="flex gap-3">
      <Zooms
        :hold-delay="100"
          :delay="Number(delay)"
          :initial-scale="Number(initialScale)"
          :scale="Number(scale)"
      >
        <div
          v-for="item in ITEMS"
          :key="item"
          class="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
        >
          {{ item }}
        </div>
      </Zooms>
    </div>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RepeatIcon" :stroke-width="2" />
      Replay
    </Button>
  </div>
</template>
