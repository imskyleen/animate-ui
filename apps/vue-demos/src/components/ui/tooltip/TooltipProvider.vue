<script setup lang="ts">
import type { TooltipProviderProps } from "@animate-ui/vue/primitives/reka-ui"
import { TooltipProvider } from "@animate-ui/vue/primitives/reka-ui"

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  delayDuration: 0,
})
</script>

<template>
  <TooltipProvider v-bind="props">
    <slot />
  </TooltipProvider>
</template>
