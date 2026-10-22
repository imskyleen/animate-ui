<script setup lang="ts">
import { RepeatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Slides } from '@animate-ui/vue/primitives/effects/slide'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string,
    direction?: 'up' | 'down' | 'left' | 'right',
    offset?: number | string
  }>(),
  { delay: 0, direction: 'up', offset: 100 },
)

const ITEMS = ['Design', 'Build', 'Ship']
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div :key="`${run}-${delay}-${direction}-${offset}`" class="flex gap-3">
      <Slides
        :hold-delay="100"
          :delay="Number(delay)"
          :direction="direction"
          :offset="Number(offset)"
      >
        <div
          v-for="item in ITEMS"
          :key="item"
          class="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
        >
          {{ item }}
        </div>
      </Slides>
    </div>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RepeatIcon" :stroke-width="2" />
      Replay
    </Button>
  </div>
</template>
