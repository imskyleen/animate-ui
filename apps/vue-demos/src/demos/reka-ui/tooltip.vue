<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

withDefaults(
  defineProps<{
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
    alignOffset?: number
    followCursor?: boolean | 'x' | 'y'
  }>(),
  { side: 'top', sideOffset: 0, align: 'center', alignOffset: 0, followCursor: false },
)
</script>

<template>
  <TooltipProvider>
    <Tooltip :follow-cursor="followCursor">
      <TooltipTrigger as-child>
        <Button variant="outline">
          Hover
        </Button>
      </TooltipTrigger>
      <TooltipContent :side="side" :side-offset="Number(sideOffset)" :align="align" :align-offset="Number(alignOffset)">
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
