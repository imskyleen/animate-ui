<script setup lang="ts">
import {
  PinnedList,
  PinnedListItems,
  PinnedListLabel,
  PinnedListPinned,
  PinnedListUnpinned,
} from '@animate-ui/vue/primitives/pinned-list'
import { computed, ref } from 'vue'
import Row from './pinned-list-row.vue'

const items = ref([
  { id: 'inbox', name: 'Inbox', pinned: false },
  { id: 'drafts', name: 'Drafts', pinned: true },
  { id: 'projects', name: 'Projects', pinned: true },
  { id: 'archive', name: 'Archive', pinned: false },
])

const pinned = computed(() => items.value.filter((item) => item.pinned))
const unpinned = computed(() => items.value.filter((item) => !item.pinned))

function toggle(id: string) {
  items.value = items.value.map((item) =>
    item.id === id ? { ...item, pinned: !item.pinned } : item,
  )
}
</script>

<template>
  <PinnedList class="flex w-60 flex-col gap-6" @pinned-change="toggle">
    <PinnedListPinned>
      <PinnedListLabel
        :hide="pinned.length === 0"
        class="mb-2 text-xs font-medium text-muted-foreground"
      >
        Pinned
      </PinnedListLabel>
      <PinnedListItems class="flex flex-col gap-2">
        <Row v-for="item in pinned" :key="item.id" :item="item" />
      </PinnedListItems>
    </PinnedListPinned>
    <PinnedListUnpinned>
      <PinnedListLabel
        :hide="unpinned.length === 0"
        class="mb-2 text-xs font-medium text-muted-foreground"
      >
        All
      </PinnedListLabel>
      <PinnedListItems class="flex flex-col gap-2">
        <Row v-for="item in unpinned" :key="item.id" :item="item" />
      </PinnedListItems>
    </PinnedListUnpinned>
  </PinnedList>
</template>
