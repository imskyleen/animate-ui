<script setup lang="ts">
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

withDefaults(
  defineProps<{
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
    alignOffset?: number
    followCursor?: boolean | 'x' | 'y'
  }>(),
  { side: 'bottom', sideOffset: 4, align: 'center', alignOffset: 0, followCursor: false },
)
</script>

<template>
  <HoverCard :follow-cursor="followCursor">
    <HoverCardTrigger as-child>
      <Button variant="link">
        @nuxt
      </Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80" :side="side" :side-offset="Number(sideOffset)" :align="align" :align-offset="Number(alignOffset)">
      <div class="flex justify-between space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/vercel.png" />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
        <div class="space-y-1">
          <h4 class="text-sm font-semibold">
            @nuxt
          </h4>
          <p class="text-sm">
            The Vue Framework – The Progressive Web Framework.
          </p>
          <div class="flex items-center pt-2">
            <HugeiconsIcon :icon="Calendar03Icon" :stroke-width="2" class="mr-2 h-4 w-4 opacity-70" />
            <span class="text-xs text-muted-foreground">
              Joined December 2021
            </span>
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
