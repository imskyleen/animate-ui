<script setup lang="ts">
import { RippleButton, RippleButtonRipples } from '@animate-ui/vue/primitives/buttons/ripple'

withDefaults(defineProps<{ tapScale?: number | string }>(), { tapScale: 0.97 })
</script>

<template>
  <RippleButton
    :tap-scale="Number(tapScale)"
    class="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium [--ripple-button-ripple-color:var(--primary-foreground)]"
  >
    Ripple Button
    <RippleButtonRipples />
  </RippleButton>
</template>
