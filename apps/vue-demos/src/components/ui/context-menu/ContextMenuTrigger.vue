<script setup lang="ts">
import type { ContextMenuTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { ContextMenuTrigger, useForwardProps } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<ContextMenuTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <ContextMenuTrigger
    data-slot="context-menu-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </ContextMenuTrigger>
</template>
