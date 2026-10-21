<script setup lang="ts">
import type { MenubarRadioGroupEmits, MenubarRadioGroupProps } from "@animate-ui/vue/primitives/reka-ui"
import {
  MenubarRadioGroup,
  useForwardPropsEmits,
} from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<MenubarRadioGroupProps>()
const emits = defineEmits<MenubarRadioGroupEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <MenubarRadioGroup
    data-slot="menubar-radio-group"
    v-bind="forwarded"
  >
    <slot />
  </MenubarRadioGroup>
</template>
