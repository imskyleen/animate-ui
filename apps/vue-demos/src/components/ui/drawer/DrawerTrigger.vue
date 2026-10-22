<script lang="ts" setup>
import type { DrawerTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import { DrawerTrigger } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DrawerTriggerProps>()
</script>

<template>
  <DrawerTrigger
    data-slot="drawer-trigger"
    v-bind="props"
  >
    <slot />
  </DrawerTrigger>
</template>
