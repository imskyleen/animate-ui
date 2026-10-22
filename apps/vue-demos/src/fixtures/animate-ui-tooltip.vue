<script setup lang="ts">
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/vue/primitives/tooltip'

const CONTENT = 'rounded-md bg-black px-3 py-1.5 text-xs text-white'
</script>

<template>
  <div class="flex gap-40">
    <TooltipProvider>
      <div class="flex w-fit flex-col gap-2">
        <Tooltip v-for="label in ['First', 'Second', 'Third']" :key="label" side="right">
          <TooltipTrigger as-child>
            <button type="button" class="rounded border px-3 py-1">
              {{ label }}
            </button>
          </TooltipTrigger>
          <TooltipContent :class="CONTENT">
            <TooltipArrow class="size-2.5 fill-black" />
            <p class="whitespace-nowrap">
              {{ label }} tip
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>

    <TooltipProvider>
      <div class="flex gap-2 pt-20">
        <Tooltip v-for="label in ['Alpha', 'Beta']" :key="label">
          <TooltipTrigger as-child>
            <button type="button" class="rounded border px-3 py-1">
              {{ label }}
            </button>
          </TooltipTrigger>
          <TooltipContent as-child>
            <section data-testid="as-child" :class="CONTENT">
              <TooltipArrow class="size-2.5 fill-black" />
              <span class="whitespace-nowrap">{{ label }} as child</span>
            </section>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  </div>
</template>
