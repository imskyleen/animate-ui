<script setup lang="ts">
import { Magnetic } from '@animate-ui/vue/primitives/effects/magnetic'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    onlyOnHover?: boolean | string
    strength?: number | string
    range?: number | string
  }>(),
  { onlyOnHover: false, strength: 0.5, range: 120 },
)
</script>

<template>
  <Magnetic
    :key="`${onlyOnHover}-${strength}-${range}`"
    :strength="Number(strength)"
    :range="Number(range)"
    :only-on-hover="onlyOnHover === true || onlyOnHover === 'true'"
  >
    <Button size="lg">
      Come closer
    </Button>
  </Magnetic>
</template>
