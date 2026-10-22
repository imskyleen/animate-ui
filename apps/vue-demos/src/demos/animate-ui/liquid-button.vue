<script setup lang="ts">
import LiquidButton from '../../../../v2/registry/vue/buttons/liquid/LiquidButton.vue'

withDefaults(
  defineProps<{ delay?: number | string, fillHeight?: number | string, tapScale?: number | string }>(),
  { delay: 0.3, fillHeight: 3, tapScale: 0.97 },
)
</script>

<template>
  <LiquidButton :delay="`${delay}s`" :fill-height="`${fillHeight}px`" :tap-scale="Number(tapScale)">
    Liquid Button
  </LiquidButton>
</template>
