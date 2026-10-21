<script setup lang="ts">
import type { MenubarSubEmits } from "@animate-ui/vue/primitives/reka-ui"
import { MenubarSub, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

interface MenubarSubRootProps {
  defaultOpen?: boolean
  open?: boolean
}

const props = defineProps<MenubarSubRootProps>()
const emits = defineEmits<MenubarSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <MenubarSub
    v-slot="slotProps"
    data-slot="menubar-sub"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </MenubarSub>
</template>
