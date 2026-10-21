<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const content =
  'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6'
const overlay = 'fixed inset-0 z-50 bg-black/20'

const open = ref(false)
const changes = ref<boolean[]>([])
const alertOpen = ref(false)

const onOpenChange = (next: boolean) => {
  open.value = next
  changes.value = [...changes.value, next]
}
</script>

<template>
  <div class="flex flex-col items-start gap-6">
    <section data-testid="controlled">
      <p data-testid="controlled-state">{{ open ? 'open' : 'closed' }}</p>
      <p data-testid="controlled-changes">{{ changes.join(',') }}</p>
      <button type="button" @click="open = true">Open from outside</button>
      <DialogRoot :open="open" @update:open="onOpenChange">
        <DialogTrigger>Controlled trigger</DialogTrigger>
        <DialogPortal>
          <DialogOverlay :class="overlay" />
          <DialogContent :class="content">
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>Opened from state.</DialogDescription>
            <DialogClose>Close controlled</DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </section>

    <section data-testid="star">
      <DialogRoot :default-open="true">
        <DialogTrigger>Star trigger</DialogTrigger>
        <DialogPortal>
          <DialogOverlay :class="overlay" />
          <DialogContent :class="content">
            <DialogTitle>Default open dialog</DialogTitle>
            <DialogDescription>Uncontrolled.</DialogDescription>
            <DialogClose>Close star</DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </section>

    <section data-testid="inline">
      <DialogRoot :modal="false">
        <DialogTrigger>Inline trigger</DialogTrigger>
        <DialogContent class="rounded-lg border p-4" data-testid="inline-content">
          <DialogTitle>Inline dialog</DialogTitle>
          <DialogDescription>No portal.</DialogDescription>
          <DialogClose>Close inline</DialogClose>
        </DialogContent>
      </DialogRoot>
    </section>

    <section data-testid="alert">
      <p data-testid="alert-state">{{ alertOpen ? 'open' : 'closed' }}</p>
      <AlertDialogRoot v-model:open="alertOpen">
        <AlertDialogTrigger>Alert trigger</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay :class="overlay" data-testid="alert-overlay" />
          <AlertDialogContent :class="content">
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction>Discard</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>
    </section>

    <section data-testid="force-mount">
      <DialogRoot>
        <DialogTrigger>Force mounted trigger</DialogTrigger>
        <DialogPortal force-mount>
          <DialogOverlay force-mount :class="overlay" />
          <DialogContent
            force-mount
            :class="content"
            data-testid="kept-content"
            @pointer-down-outside="(event: Event) => event.preventDefault()"
          >
            <DialogTitle>Kept dialog</DialogTitle>
            <DialogDescription>Always in the DOM.</DialogDescription>
            <DialogClose>Close kept</DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </section>
  </div>
</template>
