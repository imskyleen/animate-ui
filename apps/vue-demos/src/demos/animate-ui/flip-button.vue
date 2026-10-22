<script setup lang="ts">
import type { FlipDirection } from '../../../../v2/registry/vue/buttons/flip/context'
import FlipButton from '../../../../v2/registry/vue/buttons/flip/FlipButton.vue'
import FlipButtonBack from '../../../../v2/registry/vue/buttons/flip/FlipButtonBack.vue'
import FlipButtonFront from '../../../../v2/registry/vue/buttons/flip/FlipButtonFront.vue'

withDefaults(defineProps<{ from?: FlipDirection, tapScale?: number | string }>(), {
  from: 'top',
  tapScale: 0.97,
})
</script>

<template>
  <FlipButton :from="from" :tap-scale="Number(tapScale)">
    <FlipButtonFront>
      Front
    </FlipButtonFront>
    <FlipButtonBack>
      Back Button
    </FlipButtonBack>
  </FlipButton>
</template>
