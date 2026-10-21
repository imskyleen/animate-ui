<script setup lang="ts">
import type { DropdownMenuGroupProps } from "@animate-ui/vue/primitives/reka-ui"
import { DropdownMenuGroup } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DropdownMenuGroupProps>()
</script>

<template>
  <DropdownMenuGroup
    data-slot="dropdown-menu-group"
    v-bind="props"
  >
    <slot />
  </DropdownMenuGroup>
</template>
