<script setup lang="ts">
import type { AlertDialogEmits, AlertDialogProps } from "@animate-ui/vue/primitives/reka-ui"
import { AlertDialogRoot, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<AlertDialogProps>()
const emits = defineEmits<AlertDialogEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <AlertDialogRoot v-slot="slotProps" data-slot="alert-dialog" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </AlertDialogRoot>
</template>
