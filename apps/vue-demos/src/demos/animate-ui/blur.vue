<script setup lang="ts">
import { RepeatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Blurs } from '@animate-ui/vue/primitives/effects/blur'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string,
    initialBlur?: number | string,
    blur?: number | string
  }>(),
  { delay: 0, initialBlur: 10, blur: 0 },
)

const ITEMS = ['Design', 'Build', 'Ship']
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div :key="`${run}-${delay}-${initialBlur}-${blur}`" class="flex gap-3">
      <Blurs
        :hold-delay="100"
          :delay="Number(delay)"
          :initial-blur="Number(initialBlur)"
          :blur="Number(blur)"
      >
        <div
          v-for="item in ITEMS"
          :key="item"
          class="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
        >
          {{ item }}
        </div>
      </Blurs>
    </div>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RepeatIcon" :stroke-width="2" />
      Replay
    </Button>
  </div>
</template>
