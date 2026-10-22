<script setup lang="ts">
import type { PaginationListItemProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/components/ui/button"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PaginationListItem } from "@animate-ui/vue/primitives/reka-ui"
import { buttonVariants } from "@/components/ui/button"

const props = withDefaults(defineProps<PaginationListItemProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  isActive?: boolean
}>(), {
  size: "icon",
})

const delegatedProps = reactiveOmit(props, "class", "size", "isActive")
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      props.class)"
  >
    <slot />
  </PaginationListItem>
</template>
