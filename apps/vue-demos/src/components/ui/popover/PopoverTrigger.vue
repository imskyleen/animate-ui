<script setup lang="ts">
import type { PopoverTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { PopoverTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<PopoverTriggerProps>()
</script>

<template>
  <PopoverTrigger
    data-slot="popover-trigger"
    v-bind="props"
  >
    <slot />
  </PopoverTrigger>
</template>
