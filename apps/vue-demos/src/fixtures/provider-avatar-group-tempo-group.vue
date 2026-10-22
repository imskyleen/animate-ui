<script setup lang="ts">
import { AvatarGroup, AvatarGroupTooltip } from '@animate-ui/vue/primitives/avatar-group'

defineProps<{ label: string }>()
</script>

<template>
  <AvatarGroup class="h-12 -space-x-3">
    <div
      v-for="initial in ['A', 'B']"
      :key="initial"
      role="img"
      :aria-label="`${label} ${initial}`"
      class="flex size-12 items-center justify-center rounded-full bg-sky-500 text-white"
    >
      {{ initial }}
      <AvatarGroupTooltip class="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
        {{ label }} {{ initial }}
      </AvatarGroupTooltip>
    </div>
  </AvatarGroup>
</template>
