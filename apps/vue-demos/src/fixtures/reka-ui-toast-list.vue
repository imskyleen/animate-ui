<script setup lang="ts">
import { ToastClose, ToastContent, ToastRoot, ToastTitle, useToastManager } from '@animate-ui/vue/primitives/reka-ui/toast'

const props = defineProps<{ testId: string }>()
const { toasts } = useToastManager()
const toastStyle = {
  position: 'absolute',
  right: 0,
  width: '100%',
  padding: '12px',
  background: 'white',
  border: '1px solid #ccc',
  outline: '1px dashed gray',
} as const
</script>

<template>
  <ToastRoot
    v-for="item in toasts"
    :key="item.id"
    :toast="item"
    :data-testid="props.testId"
    :swipe-direction="props.testId === 'top-toast' ? 'up' : undefined"
    :style="{ ...toastStyle, ...(props.testId === 'top-toast' ? { top: 0 } : { bottom: 0 }) }"
  >
    <ToastContent>
      <ToastTitle />
      <ToastClose>Dismiss</ToastClose>
    </ToastContent>
  </ToastRoot>
</template>
