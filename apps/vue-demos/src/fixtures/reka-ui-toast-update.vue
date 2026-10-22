<script setup lang="ts">
import { createToastManager } from '@animate-ui/vue/primitives/reka-ui/toast'
import { Toaster } from '@/components/ui/toast'

const toast = createToastManager()
let id = ''
</script>

<template>
  <Toaster :toast-manager="toast" progress-bar>
    <div class="flex flex-wrap gap-2">
      <button type="button" @click="id = toast.add({ status: 'loading', title: 'Saving' })">
        Add
      </button>
      <button
        type="button"
        @click="toast.update(id, { status: 'success', title: 'Saved', description: 'Your changes to the event were saved, and everyone invited was told about the new time.' })"
      >
        Update
      </button>
      <button type="button" @click="toast.update(id, { status: 'error', title: 'Failed' })">
        Fail
      </button>
      <button type="button" @click="toast.close(id)">
        Close
      </button>
      <button type="button" @click="toast.add({ title: 'Short', duration: 2000 })">
        Short
      </button>
    </div>
  </Toaster>
</template>
