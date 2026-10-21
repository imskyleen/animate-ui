<!-- The demo with the React demo's trigger style (shadcn/ui's), which lights on hover. -->
<script setup lang="ts">
import type { CheckAnimation } from '@animate-ui/vue/provider'
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import { ref } from 'vue'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'

withDefaults(defineProps<{ checkAnimation?: CheckAnimation }>(), {
  checkAnimation: 'draw',
})

const bookmarks = ref(false)
const fullUrls = ref(true)
const profile = ref('benoit')
</script>

<template>
  <AnimateUIProvider :check-animation="checkAnimation">
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger class="hover:bg-muted aria-expanded:bg-muted">File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          New Tab <MenubarShortcut>⌘T</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          New Window <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          New Incognito Window
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Share</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>Email link</MenubarItem>
            <MenubarItem>Messages</MenubarItem>
            <MenubarItem>Notes</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem>
          Print... <MenubarShortcut>⌘P</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger class="hover:bg-muted aria-expanded:bg-muted">Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          Undo <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Find</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>Search the web</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Find...</MenubarItem>
            <MenubarItem>Find Next</MenubarItem>
            <MenubarItem>Find Previous</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem>Cut</MenubarItem>
        <MenubarItem>Copy</MenubarItem>
        <MenubarItem>Paste</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger class="hover:bg-muted aria-expanded:bg-muted">View</MenubarTrigger>
      <MenubarContent>
        <MenubarCheckboxItem v-model="bookmarks">Always Show Bookmarks Bar</MenubarCheckboxItem>
        <MenubarCheckboxItem v-model="fullUrls">
          Always Show Full URLs
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Reload <MenubarShortcut>⌘R</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled inset>
          Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Toggle Fullscreen
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Hide Sidebar
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger class="hover:bg-muted aria-expanded:bg-muted">Profiles</MenubarTrigger>
      <MenubarContent>
        <MenubarRadioGroup v-model="profile">
          <MenubarRadioItem value="andy">
            Andy
          </MenubarRadioItem>
          <MenubarRadioItem value="benoit">
            Benoit
          </MenubarRadioItem>
          <MenubarRadioItem value="Luis">
            Luis
          </MenubarRadioItem>
        </MenubarRadioGroup>
        <MenubarSeparator />
        <MenubarItem inset>
          Edit...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Add Profile...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
  </AnimateUIProvider>
</template>
