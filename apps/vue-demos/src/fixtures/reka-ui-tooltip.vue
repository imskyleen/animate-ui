<script setup lang="ts">
import { ref } from 'vue'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const tools = [
  { label: 'Bold', shortcut: '⌘B' },
  { label: 'Italic', shortcut: '⌘I' },
  { label: 'Underline', shortcut: '⌘U' },
]
const open = ref(false)
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div class="flex flex-col items-start gap-16">
      <section data-testid="controlled" class="flex items-center gap-4">
        <p data-testid="controlled-open">{{ open ? 'open' : 'closed' }}</p>
        <button type="button" @click="open = !open">Toggle from outside</button>
        <TooltipRoot v-model:open="open">
          <TooltipTrigger>Controlled trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent data-testid="controlled-content" side="right">
              Controlled tip
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </section>

      <section data-testid="default-open">
        <TooltipRoot :default-open="true">
          <TooltipTrigger>Default open trigger</TooltipTrigger>
          <TooltipContent data-testid="default-open-content" side="right">
            Open on load
          </TooltipContent>
        </TooltipRoot>
      </section>

      <section data-testid="force-mount">
        <TooltipRoot>
          <TooltipTrigger>Force mounted trigger</TooltipTrigger>
          <TooltipPortal force-mount>
            <TooltipContent data-testid="force-mount-content" side="right">
              Kept mounted
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </section>

      <section data-testid="star">
        <TooltipRoot :delay-duration="0">
          <TooltipTrigger>Star trigger</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent data-testid="star-content" side="right">
              Star tip
              <TooltipArrow />
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </section>

      <section data-testid="toolbar">
        <div class="flex items-center gap-1 rounded-xl border p-1">
          <TooltipRoot v-for="tool in tools" :key="tool.label">
            <TooltipTrigger :aria-label="tool.label" class="size-8">
              {{ tool.label[0] }}
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                data-testid="toolbar-content"
                class="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs"
              >
                {{ tool.label }}
                <span class="opacity-60">{{ tool.shortcut }}</span>
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </div>
      </section>
    </div>
  </TooltipProvider>
</template>
