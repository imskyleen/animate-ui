<script setup lang="ts">
import type { DropdownMenuTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { DropdownMenuTrigger, useForwardProps } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DropdownMenuTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <DropdownMenuTrigger
    data-slot="dropdown-menu-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </DropdownMenuTrigger>
</template>
