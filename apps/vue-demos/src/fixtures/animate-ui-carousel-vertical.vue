<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { CarouselCounter, CarouselDots } from '@animate-ui/vue/primitives/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../demos/animate-ui/carousel'
</script>

<!-- The scaled carousel standing up: three slides in a loop, dots under it. -->
<template>
  <div class="flex justify-center py-16">
    <Carousel
      orientation="vertical"
      :opts="{ loop: true, align: 'center', scale: 0.8, visible: 3 }"
      class="w-56"
    >
      <CarouselContent class="-mt-1 h-[480px]">
        <CarouselItem v-for="(_, index) in 5" :key="index" class="pt-1">
          <div class="h-full">
            <Card class="h-full">
              <CardContent class="flex h-full items-center justify-center p-6">
                <span class="text-4xl font-semibold select-none">{{ index + 1 }}</span>
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <div class="mt-16 flex flex-col items-center gap-2">
        <CarouselDots />
        <CarouselCounter />
      </div>
    </Carousel>
  </div>
</template>
