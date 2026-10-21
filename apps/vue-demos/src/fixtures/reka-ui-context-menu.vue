<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const area = 'flex h-24 w-64 items-center justify-center rounded-md border'
const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md'
const open = ref(false)
const pinned = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section class="flex items-center gap-4">
      <p data-testid="open">{{ open ? 'open' : 'closed' }}</p>
      <ContextMenuRoot @update:open="(value: boolean) => (open = value)">
        <ContextMenuTrigger :class="area">Controlled area</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent :class="content">
            <ContextMenuItem>Controlled item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenuRoot>
    </section>

    <section class="flex items-center gap-4">
      <p data-testid="pinned">{{ String(pinned) }}</p>
      <ContextMenuRoot>
        <ContextMenuTrigger :class="area">Star area</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent :class="content">
            <ContextMenuCheckboxItem v-model="pinned">
              <ContextMenuItemIndicator>✓</ContextMenuItemIndicator>
              Pinned
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenuRoot>
    </section>
  </div>
</template>
