<script setup lang="ts">
import { createToastManager, ToastPortal, ToastProvider, ToastViewport } from '@animate-ui/vue/primitives/reka-ui/toast'
import ToastFixtureList from './reka-ui-toast-list.vue'

const viewport = { position: 'fixed', right: '16px', width: '280px', zIndex: 50 } as const
const bottomManager = createToastManager()
const topManager = createToastManager()
</script>

<template>
  <div class="flex flex-col gap-4">
    <ToastProvider :toast-manager="bottomManager">
      <button type="button" @click="bottomManager.add({ title: 'Bottom toast', duration: 1000 })">
        Add
      </button>
      <ToastPortal>
        <ToastViewport :style="{ ...viewport, bottom: '16px' }">
          <ToastFixtureList test-id="bottom-toast" />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>

    <ToastProvider :toast-manager="topManager">
      <button type="button" @click="topManager.add({ title: 'Top toast', duration: 0 })">
        Add top
      </button>
      <ToastPortal>
        <ToastViewport :style="{ ...viewport, top: '16px' }">
          <ToastFixtureList test-id="top-toast" />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  </div>
</template>
