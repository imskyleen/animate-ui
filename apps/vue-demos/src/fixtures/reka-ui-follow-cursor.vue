<script setup lang="ts">
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const trigger = 'flex h-12 w-72 items-center justify-center rounded-md border text-sm'
const popup = 'rounded-md border bg-background px-3 py-1.5 text-sm'
</script>

<template>
  <div class="flex flex-col items-start gap-16 pt-16">
    <TooltipProvider :delay-duration="0">
      <TooltipRoot :follow-cursor="true">
        <TooltipTrigger :class="trigger">Reka both</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :class="popup" data-testid="reka-both">Following</TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
      <TooltipRoot follow-cursor="x">
        <TooltipTrigger :class="trigger">Reka x</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :class="popup" data-testid="reka-x">Following x</TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
    <HoverCardRoot :follow-cursor="true" :open-delay="0" :close-delay="0">
      <HoverCardTrigger :class="trigger" href="#">Reka card</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent :class="popup" data-testid="reka-card">Card</HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>
