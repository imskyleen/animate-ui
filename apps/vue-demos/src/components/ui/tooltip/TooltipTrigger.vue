<script setup lang="ts">
import type { TooltipTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { TooltipTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<TooltipTriggerProps>()
</script>

<template>
  <TooltipTrigger
    data-slot="tooltip-trigger"
    v-bind="props"
  >
    <slot />
  </TooltipTrigger>
</template>
