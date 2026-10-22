<script setup lang="ts">
import { Tilt, TiltContent } from '@animate-ui/vue/primitives/effects/tilt'

withDefaults(
  defineProps<{ maxTilt?: number | string, perspective?: number | string }>(),
  { maxTilt: 10, perspective: 800 },
)

const COLORS = ['bg-neutral-800', 'bg-red-950', 'bg-blue-950']
</script>

<template>
  <Tilt :max-tilt="Number(maxTilt)" :perspective="Number(perspective)" class="w-full max-w-60">
    <TiltContent class="flex flex-col gap-3 rounded-2xl border bg-card p-2 pb-5 shadow-sm">
      <img
        :src="'/demos/mug.webp'"
        alt="Black porcelain mug with a square handle and natural clay accents"
        width="240"
        height="240"
        class="aspect-square w-full rounded-xl bg-white object-cover"
        draggable="false"
      >
      <div class="text-center">
        <p class="text-xs text-muted-foreground">
          Dark Grey
        </p>
        <h3 class="font-medium">
          Matt Mug
        </h3>
        <p class="text-sm">
          $20
        </p>
      </div>
      <ul class="flex items-center justify-center gap-2">
        <li v-for="color in COLORS" :key="color" :class="`size-4 rounded-full border ${color}`" />
      </ul>
    </TiltContent>
  </Tilt>
</template>
