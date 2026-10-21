<script setup lang="ts">
import type { MenubarGroupProps } from "@animate-ui/vue/primitives/reka-ui"
import { MenubarGroup } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<MenubarGroupProps>()
</script>

<template>
  <MenubarGroup
    data-slot="menubar-group"
    v-bind="props"
  >
    <slot />
  </MenubarGroup>
</template>
