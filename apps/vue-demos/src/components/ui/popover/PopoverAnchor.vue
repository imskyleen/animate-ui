<script setup lang="ts">
import type { PopoverAnchorProps } from "@animate-ui/vue/primitives/reka-ui"
import { PopoverAnchor } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<PopoverAnchorProps>()
</script>

<template>
  <PopoverAnchor
    data-slot="popover-anchor"
    v-bind="props"
  >
    <slot />
  </PopoverAnchor>
</template>
