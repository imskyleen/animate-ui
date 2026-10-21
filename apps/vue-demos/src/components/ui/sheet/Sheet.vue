<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from "@animate-ui/vue/primitives/reka-ui"
import { DialogRoot, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DialogRootProps>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogRoot
    v-slot="slotProps"
    data-slot="sheet"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </DialogRoot>
</template>
