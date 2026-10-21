<script setup lang="ts">
import type { CollapsibleContentProps } from "@animate-ui/vue/primitives/reka-ui"
import { CollapsibleContent } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<CollapsibleContentProps>()
</script>

<template>
  <CollapsibleContent
    data-slot="collapsible-content"
    v-bind="props"
  >
    <slot />
  </CollapsibleContent>
</template>
