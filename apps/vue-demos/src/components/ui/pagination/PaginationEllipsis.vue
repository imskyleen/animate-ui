<script setup lang="ts">
import type { PaginationEllipsisProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PaginationEllipsis } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <PaginationEllipsis
    data-slot="pagination-ellipsis"
    v-bind="delegatedProps"
    :class="cn('flex size-9 items-center justify-center', props.class)"
  >
    <slot>
      <HugeiconsIcon :icon="MoreHorizontalIcon" :stroke-width="2" class="size-4" />
      <span class="sr-only">More pages</span>
    </slot>
  </PaginationEllipsis>
</template>
