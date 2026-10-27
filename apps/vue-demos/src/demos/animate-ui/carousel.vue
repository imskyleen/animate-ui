<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { CarouselCounter, CarouselDots } from '@animate-ui/vue/primitives/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel'

const props = withDefaults(
  defineProps<{
    scale?: number | string
    visible?: number | string
    loop?: boolean | string
    dots?: boolean | string
    counter?: boolean | string
  }>(),
  { scale: 0.8, visible: 3, loop: true, dots: true, counter: true },
)

const on = (value: boolean | string) => String(value) === 'true'
const shown = computed(() => Number(props.visible))
// The row's width in slides: the selected one, then the smaller ones out.
const row = computed(() => {
  const scale = Number(props.scale)
  let width = 1
  for (let n = 1; n <= (shown.value - 1) / 2; n++) width += 2 * scale ** n
  if (shown.value % 2 === 0) width += scale ** (shown.value / 2)
  return width
})
// A loop needs a slide more than it shows on each side.
const count = computed(() => Math.max(5, 2 * Math.floor(shown.value / 2) + 3))
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <Carousel
      :key="`${on(loop)}-${count}`"
      :opts="{ loop: on(loop), align: 'center', containScroll: false, scale: Number(scale), visible: shown }"
      class="w-full"
      :style="{ maxWidth: `min(${16 * row}rem, 100% - 7rem)` }"
    >
      <CarouselContent class="-ml-1">
        <CarouselItem v-for="(_, index) in count" :key="index" class="pl-1">
          <div>
            <Card class="border-[color-mix(in_oklab,var(--foreground)_10%,var(--card))]">
              <CardContent class="flex aspect-[13/15] items-center justify-center p-6">
                <span class="text-4xl font-semibold select-none">{{ index + 1 }}</span>
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <div v-if="on(dots) || on(counter)" class="mt-4 flex flex-col items-center gap-2">
        <CarouselDots v-if="on(dots)" />
        <CarouselCounter v-if="on(counter)" class="text-sm text-muted-foreground" />
      </div>
    </Carousel>
  </div>
</template>
