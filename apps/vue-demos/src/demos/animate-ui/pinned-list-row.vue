<script setup lang="ts">
import { PinIcon, PinOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { PinnedListItem, PinnedListTrigger } from '@animate-ui/vue/primitives/pinned-list'

defineProps<{ item: { id: string; name: string; pinned: boolean } }>()
</script>

<template>
  <PinnedListItem
    :id="item.id"
    custom-trigger
    class="flex h-12 items-center justify-between rounded-xl bg-accent px-4 text-sm select-none"
  >
    {{ item.name }}
    <PinnedListTrigger
      :aria-label="item.pinned ? `Unpin ${item.name}` : `Pin ${item.name}`"
      class="-mr-2 flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground"
    >
      <HugeiconsIcon :icon="item.pinned ? PinOffIcon : PinIcon" :stroke-width="2" :size="16" />
    </PinnedListTrigger>
  </PinnedListItem>
</template>
