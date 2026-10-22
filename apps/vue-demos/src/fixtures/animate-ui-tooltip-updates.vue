<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/vue/primitives/tooltip'
import { ref } from 'vue'

const copied = ref(false)
const shown = ref(true)
const completions = ref(0)
</script>

<template>
  <TooltipProvider>
    <div class="flex flex-col items-start gap-16 p-16">
      <Tooltip>
        <TooltipTrigger as-child>
          <button @click="copied = true">
            Copy link
          </button>
        </TooltipTrigger>
        <TooltipContent>{{ copied ? 'Copied!' : 'Copy' }}</TooltipContent>
      </Tooltip>
      <Tooltip v-if="shown">
        <TooltipTrigger as-child>
          <button @keydown="(event: KeyboardEvent) => { if (event.key === 'Delete') shown = false }">
            Removable
          </button>
        </TooltipTrigger>
        <TooltipContent>Removable tip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <button>Tracked</button>
        </TooltipTrigger>
        <TooltipContent @animation-complete="completions++">
          Tracked tip
        </TooltipContent>
      </Tooltip>
      <output data-testid="completions">{{ completions }}</output>
    </div>
  </TooltipProvider>
</template>
