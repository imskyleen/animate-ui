<script setup lang="ts">
import type { DialogTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { DialogTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DialogTriggerProps>()
</script>

<template>
  <DialogTrigger
    data-slot="dialog-trigger"
    v-bind="props"
  >
    <slot />
  </DialogTrigger>
</template>
