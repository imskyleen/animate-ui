<script setup lang="ts">
import type { PaginationFirstProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/components/ui/button"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PaginationFirst, useForwardProps } from "@animate-ui/vue/primitives/reka-ui"
import { buttonVariants } from "@/components/ui/button"

const props = withDefaults(defineProps<PaginationFirstProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  size: "default",
})

const delegatedProps = reactiveOmit(props, "class", "size")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationFirst
    data-slot="pagination-first"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'gap-1 px-2.5 sm:pr-2.5', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <HugeiconsIcon :icon="ArrowLeft01Icon" :stroke-width="2" />
      <span class="hidden sm:block">First</span>
    </slot>
  </PaginationFirst>
</template>
