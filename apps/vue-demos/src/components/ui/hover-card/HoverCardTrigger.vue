<script setup lang="ts">
import type { HoverCardTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { HoverCardTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<HoverCardTriggerProps>()
</script>

<template>
  <HoverCardTrigger
    data-slot="hover-card-trigger"
    v-bind="props"
  >
    <slot />
  </HoverCardTrigger>
</template>
