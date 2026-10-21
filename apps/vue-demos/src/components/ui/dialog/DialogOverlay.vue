<script setup lang="ts">
import type { DialogOverlayProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { DialogOverlay } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="cn('fixed inset-0 z-50 bg-black/80', props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
