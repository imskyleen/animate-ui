<script setup lang="ts">
import type { SelectItemTextProps } from "@animate-ui/vue/primitives/reka-ui"
import { SelectItemText } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<SelectItemTextProps>()
</script>

<template>
  <SelectItemText
    data-slot="select-item-text"
    v-bind="props"
  >
    <slot />
  </SelectItemText>
</template>
