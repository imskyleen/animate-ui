<script setup lang="ts">
import { Button } from '@animate-ui/vue/primitives/buttons/button'

withDefaults(defineProps<{ tapScale?: number | string }>(), { tapScale: 0.97 })
</script>

<template>
  <Button
    :tap-scale="Number(tapScale)"
    class="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium"
  >
    Button
  </Button>
</template>
