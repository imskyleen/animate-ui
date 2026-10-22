<script setup lang="ts">
import { Image, ImageZoom } from '@animate-ui/vue/primitives/effects/image-zoom'
</script>

<template>
  <ImageZoom
    aria-label="Black porcelain mug, zoomable"
    class="rounded-2xl border bg-white"
    width="256px"
    height="256px"
  >
    <Image
      :src="'/demos/mug.webp'"
      alt="Black porcelain mug with a square handle and natural clay accents"
      width="256"
      height="256"
    />
  </ImageZoom>
</template>
