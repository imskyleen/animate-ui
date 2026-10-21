<script setup lang="ts">
import type { ContextMenuPortalProps } from "@animate-ui/vue/primitives/reka-ui"
import { ContextMenuPortal } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<ContextMenuPortalProps>()
</script>

<template>
  <ContextMenuPortal
    data-slot="context-menu-portal"
    v-bind="props"
  >
    <slot />
  </ContextMenuPortal>
</template>
