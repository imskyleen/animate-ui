<script setup lang="ts">
import { MinusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
</script>

<template>
  <div
    data-slot="input-otp-separator"
    class="[&_svg:not([class*='size-'])]:size-4 flex items-center"
    role="separator"
  >
    <HugeiconsIcon :icon="MinusSignIcon" :stroke-width="2" />
  </div>
</template>
