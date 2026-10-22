<script setup lang="ts">
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@animate-ui/vue/primitives/reka-ui/drawer'
import { ref } from 'vue'

const backdrop = 'fixed inset-0 z-50 bg-black/20'
const open = ref(false)
const changes = ref<string[]>([])

function onOpen(next: boolean, details?: { reason?: string }) {
  open.value = next
  changes.value = [...changes.value, `${next}:${details?.reason}`]
}
</script>

<template>
  <div class="flex flex-col items-start gap-6">
    <section data-testid="controlled">
      <p data-testid="controlled-state">
        {{ open ? 'open' : 'closed' }}
      </p>
      <p data-testid="controlled-changes">
        {{ changes.join(',') }}
      </p>
      <button type="button" @click="open = true">
        Open from outside
      </button>
      <DrawerRoot :open="open" @update:open="onOpen">
        <DrawerPortal>
          <DrawerOverlay :class="backdrop" data-testid="bottom-backdrop" />
          <DrawerContent
            class="fixed inset-x-0 bottom-0 z-50 h-64 rounded-t-xl border bg-background p-6"
            data-testid="bottom-popup"
          >
            <DrawerTitle>Bottom drawer</DrawerTitle>
            <DrawerDescription>Controlled.</DrawerDescription>
            <DrawerClose>Close bottom</DrawerClose>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </section>

    <section data-testid="themed">
      <DrawerRoot>
        <DrawerTrigger>Open themed drawer</DrawerTrigger>
        <DrawerPortal>
          <DrawerOverlay class="fixed inset-0 z-50 bg-black/20 dark:bg-white/30" data-testid="themed-backdrop" />
          <DrawerContent class="fixed inset-x-0 bottom-0 z-50 border bg-background p-6">
            <DrawerTitle>Themed drawer</DrawerTitle>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </section>

    <section data-testid="right">
      <DrawerRoot swipe-direction="right">
        <DrawerTrigger>Open right drawer</DrawerTrigger>
        <DrawerPortal>
          <DrawerOverlay :class="backdrop" />
          <DrawerContent
            class="fixed inset-y-0 right-0 z-50 w-80 border bg-background p-6"
            data-testid="right-popup"
            :transition="{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }"
            :exit-transition="{ duration: 0.1 }"
          >
            <DrawerTitle>Right drawer</DrawerTitle>
            <DrawerDescription>Custom timing.</DrawerDescription>
            <DrawerClose>Close right</DrawerClose>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </section>

    <section data-testid="gradient">
      <DrawerRoot>
        <DrawerTrigger>Open gradient drawer</DrawerTrigger>
        <DrawerPortal>
          <DrawerOverlay
            class="fixed inset-0 z-50 bg-linear-to-t from-black/40 to-transparent"
            data-testid="gradient-backdrop"
          />
          <DrawerContent
            class="fixed inset-x-0 bottom-0 z-50 h-64 rounded-t-xl border bg-background p-6"
            data-testid="gradient-popup"
          >
            <DrawerTitle>Gradient backdrop</DrawerTitle>
            <DrawerDescription>It fades.</DrawerDescription>
            <DrawerClose>Close gradient</DrawerClose>
          </DrawerContent>
        </DrawerPortal>
      </DrawerRoot>
    </section>
  </div>
</template>
