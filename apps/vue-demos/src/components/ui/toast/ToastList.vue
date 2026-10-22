<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import {
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastRoot,
  ToastTitle,
  useToastManager,
} from "@animate-ui/vue/primitives/reka-ui/toast"
import { Button } from "@/components/ui/button"
import ToastIcon from "./ToastIcon.vue"

const { toasts } = useToastManager()
</script>

<template>
  <ToastRoot
    v-for="item in toasts"
    :key="item.id"
    :toast="item"
    data-slot="toast"
    class="rounded-2xl group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] h-(--height) after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-expanded:h-(--toast-height) data-limited:opacity-0"
  >
    <ToastContent
      data-slot="toast-content"
      class="flex h-full items-center gap-3 overflow-hidden p-4 data-behind:opacity-0 data-expanded:opacity-100"
    >
      <ToastIcon :status="item.status" />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <ToastTitle data-slot="toast-title" class="text-sm font-medium" />
        <ToastDescription data-slot="toast-description" class="text-sm text-muted-foreground" />
      </div>
      <ToastAction v-if="item.actionProps" data-slot="toast-action" as-child class="shrink-0">
        <Button variant="outline" size="sm">
          {{ item.actionProps.label }}
        </Button>
      </ToastAction>
      <ToastClose data-slot="toast-close" aria-label="Close toast" as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          class="relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground"
        >
          <HugeiconsIcon :icon="Cancel01Icon" :stroke-width="2" aria-hidden="true" />
        </Button>
      </ToastClose>
    </ToastContent>
  </ToastRoot>
</template>
