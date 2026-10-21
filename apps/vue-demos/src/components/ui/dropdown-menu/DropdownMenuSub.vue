<script setup lang="ts">
import type { DropdownMenuSubEmits, DropdownMenuSubProps } from "@animate-ui/vue/primitives/reka-ui"
import {
  DropdownMenuSub,
  useForwardPropsEmits,
} from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DropdownMenuSubProps>()
const emits = defineEmits<DropdownMenuSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuSub v-slot="slotProps" data-slot="dropdown-menu-sub" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuSub>
</template>
