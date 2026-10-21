<script setup lang="ts">
import type { DialogCloseProps } from "@animate-ui/vue/primitives/reka-ui"
import { DialogClose } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DialogCloseProps>()
</script>

<template>
  <DialogClose
    data-slot="sheet-close"
    v-bind="props"
  >
    <slot />
  </DialogClose>
</template>
