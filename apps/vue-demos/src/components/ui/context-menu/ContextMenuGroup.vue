<script setup lang="ts">
import type { ContextMenuGroupProps } from "@animate-ui/vue/primitives/reka-ui"
import { ContextMenuGroup } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<ContextMenuGroupProps>()
</script>

<template>
  <ContextMenuGroup
    data-slot="context-menu-group"
    v-bind="props"
  >
    <slot />
  </ContextMenuGroup>
</template>
