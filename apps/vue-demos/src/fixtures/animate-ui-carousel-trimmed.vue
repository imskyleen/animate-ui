<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { CarouselCounter } from '@animate-ui/vue/primitives/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../demos/animate-ui/carousel'
</script>

<!-- shadcn-vue's options as they come: no loop, the end snaps trimmed. -->
<template>
  <Carousel
    :opts="{ align: 'center', scale: 0.8 }"
    class="w-full max-w-[min(42rem,calc(100%-7rem))]"
  >
    <CarouselContent class="-ml-1">
      <CarouselItem v-for="(_, index) in 5" :key="index" class="basis-[calc(100%/2.6-1px)] pl-1">
        <div>
          <Card>
            <CardContent class="flex aspect-[13/15] items-center justify-center p-6">
              <span class="text-4xl font-semibold">{{ index + 1 }}</span>
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
    <CarouselCounter />
  </Carousel>
</template>
