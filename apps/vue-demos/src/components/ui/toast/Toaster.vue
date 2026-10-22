<script setup lang="ts">
import type { ToastManager } from "@animate-ui/vue/primitives/reka-ui/toast"
import { ToastPortal, ToastProvider, ToastViewport } from "@animate-ui/vue/primitives/reka-ui/toast"
import { toast } from "."
import ToastList from "./ToastList.vue"

const props = withDefaults(
  defineProps<{ toastManager?: ToastManager, progressBar?: boolean }>(),
  { progressBar: true },
)
</script>

<template>
  <ToastProvider :toast-manager="props.toastManager ?? toast" :progress-bar="props.progressBar">
    <slot />
    <ToastPortal data-slot="toast-portal">
      <ToastViewport
        data-slot="toast-viewport"
        class="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full"
      >
        <ToastList />
      </ToastViewport>
    </ToastPortal>
  </ToastProvider>
</template>
