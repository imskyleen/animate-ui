<script setup lang="ts">
import type { SelectGroupProps } from "@animate-ui/vue/primitives/reka-ui"
import { SelectGroup } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<SelectGroupProps>()
</script>

<template>
  <SelectGroup
    data-slot="select-group"
    v-bind="props"
  >
    <slot />
  </SelectGroup>
</template>
