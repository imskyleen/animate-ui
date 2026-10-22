<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { createToastManager } from "@animate-ui/vue/primitives/reka-ui/toast"
import { Toaster } from "@/components/ui/toast"

const toast = createToastManager()

const props = withDefaults(defineProps<{ progressBar?: boolean | string }>(), {
  progressBar: true,
})

function showToast() {
  const id = toast.add({
    title: "Event created",
    description: "Sunday, December 3 at 9:00 AM",
    actionProps: {
      label: "Undo",
      altText: "Undo",
      onClick() {
        toast.close(id)
      },
    },
  })
}
</script>

<template>
  <Toaster :toast-manager="toast" :progress-bar="props.progressBar === true || props.progressBar === 'true'">
    <Button variant="outline" @click="showToast">
      Show Toast
    </Button>
  </Toaster>
</template>
