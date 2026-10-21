<script setup lang="ts">
import type { MenubarMenuProps } from "@animate-ui/vue/primitives/reka-ui"
import { MenubarMenu } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<MenubarMenuProps>()
</script>

<template>
  <MenubarMenu
    data-slot="menubar-menu"
    v-bind="props"
  >
    <slot />
  </MenubarMenu>
</template>
