<script setup lang="ts">
import type { PaginationLastProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/components/ui/button"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PaginationLast, useForwardProps } from "@animate-ui/vue/primitives/reka-ui"
import { buttonVariants } from "@/components/ui/button"

const props = withDefaults(defineProps<PaginationLastProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  size: "default",
})

const delegatedProps = reactiveOmit(props, "class", "size")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationLast
    data-slot="pagination-last"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'gap-1 px-2.5 sm:pr-2.5', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <span class="hidden sm:block">Last</span>
      <HugeiconsIcon :icon="ArrowRight01Icon" :stroke-width="2" />
    </slot>
  </PaginationLast>
</template>
