<script setup lang="ts">
import { RepeatIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Effects } from '@animate-ui/vue/primitives/effects/effect'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string,
    blur?: boolean | string,
    slide?: boolean | string,
    fade?: boolean | string,
    zoom?: boolean | string
  }>(),
  { delay: 0, blur: true, slide: true, fade: true, zoom: true },
)

const ITEMS = ['Design', 'Build', 'Ship']
const run = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <div :key="`${run}-${delay}-${blur}-${slide}-${fade}-${zoom}`" class="flex gap-3">
      <Effects
        :hold-delay="100"
          :delay="Number(delay)"
          :blur="blur === true || blur === 'true'"
          :slide="slide === true || slide === 'true'"
          :fade="fade === true || fade === 'true'"
          :zoom="zoom === true || zoom === 'true'"
      >
        <div
          v-for="item in ITEMS"
          :key="item"
          class="flex h-20 w-24 items-center justify-center rounded-xl bg-accent text-sm font-medium"
        >
          {{ item }}
        </div>
      </Effects>
    </div>
    <Button variant="outline" size="sm" @click="run++">
      <HugeiconsIcon :icon="RepeatIcon" :stroke-width="2" />
      Replay
    </Button>
  </div>
</template>
