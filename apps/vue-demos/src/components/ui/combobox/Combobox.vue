<script setup lang="ts">
import type { ComboboxRootEmits, ComboboxRootProps } from "@animate-ui/vue/primitives/reka-ui"
import { ComboboxRoot, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<ComboboxRootProps>()
const emits = defineEmits<ComboboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ComboboxRoot
    v-slot="slotProps"
    data-slot="combobox"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </ComboboxRoot>
</template>
