<script setup lang="ts">
import { Add01Icon, Delete02Icon, SourceCodeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import type { CheckAnimation } from '@animate-ui/vue/provider'
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import { ref } from 'vue'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

withDefaults(defineProps<{ checkAnimation?: CheckAnimation }>(), {
  checkAnimation: 'draw',
})

const showBookmarks = ref(true)
const showFullUrls = ref(false)
const user = ref('pedro')
</script>

<template>
  <AnimateUIProvider :check-animation="checkAnimation">
  <ContextMenu>
    <ContextMenuTrigger class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
      Right click here
    </ContextMenuTrigger>
    <ContextMenuContent class="w-52">
      <ContextMenuItem inset>
        Back
        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset disabled>
        Forward
        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem inset>
        Reload
        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>
          More Tools
        </ContextMenuSubTrigger>
        <ContextMenuSubContent class="w-44">
          <ContextMenuItem inset>
            Save Page...
            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <HugeiconsIcon :icon="Add01Icon" :stroke-width="2" />
            Create Shortcut...
          </ContextMenuItem>
          <ContextMenuItem inset>
            Name Window...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <HugeiconsIcon :icon="SourceCodeIcon" :stroke-width="2" />
            Developer Tools
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <HugeiconsIcon :icon="Delete02Icon" :stroke-width="2" />
            Delete
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem v-model="showBookmarks">
        Show Bookmarks
        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="showFullUrls">Show Full URLs</ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuRadioGroup v-model="user">
        <ContextMenuLabel inset>
          People
        </ContextMenuLabel>
        <ContextMenuRadioItem value="pedro">
          Pedro Duarte
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="colm">
          Colm Tuite
        </ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </ContextMenuContent>
  </ContextMenu>
  </AnimateUIProvider>
</template>
