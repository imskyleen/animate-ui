<script lang="ts" setup>
import type { DrawerCloseProps } from "@animate-ui/vue/primitives/reka-ui"
import { DrawerClose } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DrawerCloseProps>()
</script>

<template>
  <DrawerClose
    data-slot="drawer-close"
    v-bind="props"
  >
    <slot />
  </DrawerClose>
</template>
