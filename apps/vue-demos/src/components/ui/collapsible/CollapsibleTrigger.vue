<script setup lang="ts">
import type { CollapsibleTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { CollapsibleTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<CollapsibleTriggerProps>()
</script>

<template>
  <CollapsibleTrigger
    data-slot="collapsible-trigger"
    v-bind="props"
  >
    <slot />
  </CollapsibleTrigger>
</template>
