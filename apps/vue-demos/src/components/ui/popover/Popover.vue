<script setup lang="ts">
import type { PopoverRootEmits, PopoverRootProps } from "@animate-ui/vue/primitives/reka-ui"
import { PopoverRoot, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<PopoverRootProps>()
const emits = defineEmits<PopoverRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PopoverRoot
    v-slot="slotProps"
    data-slot="popover"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </PopoverRoot>
</template>
