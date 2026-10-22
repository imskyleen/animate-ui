<script setup lang="ts">
import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from '@animate-ui/vue/primitives/avatar-group'
import { cn } from 'cn'
import { motion } from 'motion-v'

const PEOPLE = [
  { name: 'Skyleen', initials: 'SK', class: 'bg-rose-500' },
  { name: 'Shadcn', initials: 'CN', class: 'bg-amber-500' },
  { name: 'Adam Wathan', initials: 'AW', class: 'bg-emerald-500' },
  { name: 'Guillermo Rauch', initials: 'GR', class: 'bg-sky-500' },
  { name: 'Jhey', initials: 'JH', class: 'bg-violet-500' },
  { name: 'David Haz', initials: 'DH', class: 'bg-fuchsia-500' },
]
</script>

<template>
  <AvatarGroup class="h-12 -space-x-3" invert-overlap>
    <div
      v-for="person in PEOPLE"
      :key="person.name"
      role="img"
      :aria-label="person.name"
      tabindex="0"
      :class="cn(
        'flex size-12 items-center justify-center rounded-full border-3 border-background text-sm font-medium text-white outline-none select-none focus-visible:ring-2 focus-visible:ring-ring',
        person.class,
      )"
    >
      {{ person.initials }}
      <AvatarGroupTooltip class="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
        <AvatarGroupTooltipArrow class="size-2.5 fill-foreground" />
        <motion.p layout="preserve-aspect" class="whitespace-nowrap">
          {{ person.name }}
        </motion.p>
      </AvatarGroupTooltip>
    </div>
  </AvatarGroup>
</template>
