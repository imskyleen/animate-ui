<script setup lang="ts">
import * as parts from '../demos/animate-ui/carousel'
import CarouselDemos from './lib/carousel-demos.vue'
</script>

<!-- shadcn-vue's demos on its carousel animated by Animate UI, without the options. -->
<template>
  <CarouselDemos :parts="parts" />
</template>
