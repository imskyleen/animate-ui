<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { createToastManager } from "@animate-ui/vue/primitives/reka-ui/toast"
import { Toaster } from "@/components/ui/toast"

const toast = createToastManager()

function showToast() {
  toast.promise(
    new Promise<{ name: string }>((resolve) => {
      window.setTimeout(() => resolve({ name: "Event" }), 2000)
    }),
    {
      loading: "Creating event…",
      success: data => `${data.name} created.`,
      error: "Could not create event.",
    },
  )
}
</script>

<template>
  <Toaster :toast-manager="toast">
    <Button variant="outline" @click="showToast">
      Create Event
    </Button>
  </Toaster>
</template>
