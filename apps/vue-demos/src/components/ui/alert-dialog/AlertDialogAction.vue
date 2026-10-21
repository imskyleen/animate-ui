<script setup lang="ts">
import type { AlertDialogActionProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { AlertDialogAction } from "@animate-ui/vue/primitives/reka-ui"
import { buttonVariants } from "@/components/ui/button"

const props = defineProps<AlertDialogActionProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants(), props.class)">
    <slot />
  </AlertDialogAction>
</template>
