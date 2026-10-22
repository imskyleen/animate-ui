<script setup lang="ts">
import type { TooltipProps } from '@animate-ui/vue/primitives/tooltip'
import {
  Link01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/vue/primitives/tooltip'
import { Button } from '@/components/ui/button'

const TOOLS = [
  { label: 'Bold', shortcut: '⌘B', icon: TextBoldIcon },
  { label: 'Italic', shortcut: '⌘I', icon: TextItalicIcon },
  { label: 'Underline', shortcut: '⌘U', icon: TextUnderlineIcon },
  { label: 'Strikethrough', shortcut: '⌘⇧X', icon: TextStrikethroughIcon },
  { label: 'Insert link', shortcut: '⌘K', icon: Link01Icon },
]

withDefaults(
  defineProps<{
    openDelay?: number | string
    closeDelay?: number | string
    side?: TooltipProps['side']
    sideOffset?: number | string
    align?: TooltipProps['align']
    alignOffset?: number | string
    withTransition?: boolean | string
  }>(),
  {
    openDelay: 0,
    closeDelay: 300,
    side: 'top',
    sideOffset: 10,
    align: 'center',
    alignOffset: 0,
    withTransition: true,
  },
)

const on = (value: boolean | string) => value === true || value === 'true'
</script>

<template>
  <TooltipProvider :open-delay="Number(openDelay)" :close-delay="Number(closeDelay)">
    <div class="flex items-center gap-1 rounded-xl border p-1">
      <Tooltip
        v-for="tool in TOOLS"
        :key="tool.label"
        :side="side"
        :side-offset="Number(sideOffset)"
        :align="align"
        :align-offset="Number(alignOffset)"
      >
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon" :aria-label="tool.label">
            <HugeiconsIcon :icon="tool.icon" :stroke-width="2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent class="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
          <TooltipArrow class="size-2.5 fill-foreground" :with-transition="on(withTransition)" />
          <p class="flex items-center gap-2 whitespace-nowrap">
            {{ tool.label }}
            <span class="opacity-60">{{ tool.shortcut }}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>
