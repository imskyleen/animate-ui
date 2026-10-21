<script setup lang="ts">
import { TextBoldIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <Toggle aria-label="Toggle bold">
    <HugeiconsIcon :icon="TextBoldIcon" :stroke-width="2" class="h-4 w-4" />
  </Toggle>
</template>
