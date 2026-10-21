<script setup lang="ts">
import type { AvatarImageProps } from "@animate-ui/vue/primitives/reka-ui"
import { AvatarImage } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<AvatarImageProps>()
</script>

<template>
  <AvatarImage
    data-slot="avatar-image"
    v-bind="props"
    class="aspect-square size-full"
  >
    <slot />
  </AvatarImage>
</template>
