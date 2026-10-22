<script setup lang="ts">
import { Image, ImageZoom } from '@animate-ui/vue/primitives/effects/image-zoom'
import { ref } from 'vue'

const log = ref<string[]>([])
const zoom = ref<{ $el?: HTMLElement } | null>(null)
const push = (entry: string) => log.value.push(entry)
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div style="width: 200px; height: 200px">
      <ImageZoom
        ref="zoom"
        aria-label="Zoomable"
        :zoom-on-hover="false"
        @click="push(`click ${zoom?.$el?.tagName}`)"
        @mouseenter="push('enter')"
      >
        <Image :src="'/apple-touch-icon.png'" alt="" />
      </ImageZoom>
    </div>
    <output data-testid="log">{{ log.join(',') }}</output>
  </div>
</template>
