<script setup lang="ts">
import type { SelectValueProps } from "@animate-ui/vue/primitives/reka-ui"
import { SelectValue } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<SelectValueProps>()
</script>

<template>
  <SelectValue
    data-slot="select-value"
    v-bind="props"
  >
    <slot />
  </SelectValue>
</template>
