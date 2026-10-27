<script setup lang="ts">
import type * as Parts from './shadcn-carousel'
import { Card, CardContent } from '@/components/ui/card'

// shadcn-vue's carousel demos, as its docs show them.
const props = defineProps<{ parts: typeof Parts }>()
const { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } = props.parts
</script>

<template>
  <div class="flex flex-col items-center gap-16 px-16">
    <div data-demo="default" class="flex w-full justify-center">
      <Carousel class="w-full max-w-[12rem] sm:max-w-xs">
        <CarouselContent>
          <CarouselItem v-for="(_, index) in 5" :key="index">
            <div class="p-1">
              <Card>
                <CardContent class="flex aspect-square items-center justify-center p-6">
                  <span class="text-4xl font-semibold">{{ index + 1 }}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
    <div data-demo="size" class="flex w-full justify-center">
      <Carousel :opts="{ align: 'start' }" class="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm">
        <CarouselContent>
          <CarouselItem v-for="(_, index) in 5" :key="index" class="basis-1/2 lg:basis-1/3">
            <div class="p-1">
              <Card>
                <CardContent class="flex aspect-square items-center justify-center p-6">
                  <span class="text-3xl font-semibold">{{ index + 1 }}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
    <div data-demo="spacing" class="flex w-full justify-center">
      <Carousel class="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm">
        <CarouselContent class="-ml-1">
          <CarouselItem v-for="(_, index) in 5" :key="index" class="basis-1/2 pl-1 lg:basis-1/3">
            <div class="p-1">
              <Card>
                <CardContent class="flex aspect-square items-center justify-center p-6">
                  <span class="text-2xl font-semibold">{{ index + 1 }}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
    <div data-demo="orientation" class="flex w-full justify-center py-12">
      <Carousel :opts="{ align: 'start' }" orientation="vertical" class="w-full max-w-xs">
        <CarouselContent class="-mt-1 h-[270px]">
          <CarouselItem v-for="(_, index) in 5" :key="index" class="basis-1/2 pt-1">
            <div class="p-1">
              <Card>
                <CardContent class="flex items-center justify-center p-6">
                  <span class="text-3xl font-semibold">{{ index + 1 }}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
</template>
