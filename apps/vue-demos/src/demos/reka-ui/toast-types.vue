<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { createToastManager } from "@animate-ui/vue/primitives/reka-ui/toast"
import { Toaster } from "@/components/ui/toast"

const toast = createToastManager()
</script>

<template>
  <Toaster :toast-manager="toast">
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="toast.add({ description: 'Event has been created.' })">
        Default
      </Button>
      <Button
        variant="outline"
        @click="toast.add({ status: 'success', description: 'Event has been created.' })"
      >
        Success
      </Button>
      <Button
        variant="outline"
        @click="toast.add({ status: 'info', description: 'Arrive 10 minutes before the event.' })"
      >
        Info
      </Button>
      <Button
        variant="outline"
        @click="toast.add({ status: 'warning', description: 'The event cannot start before 8:00 AM.' })"
      >
        Warning
      </Button>
      <Button
        variant="outline"
        @click="toast.add({ status: 'error', description: 'The event could not be created.', type: 'foreground' })"
      >
        Error
      </Button>
    </div>
  </Toaster>
</template>
