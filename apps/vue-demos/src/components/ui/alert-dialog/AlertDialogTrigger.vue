<script setup lang="ts">
import type { AlertDialogTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { AlertDialogTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<AlertDialogTriggerProps>()
</script>

<template>
  <AlertDialogTrigger data-slot="alert-dialog-trigger" v-bind="props">
    <slot />
  </AlertDialogTrigger>
</template>
