<script setup lang="ts">
import StarsBackground from '../../../../v2/registry/vue/backgrounds/stars/StarsBackground.vue'
import { useDark } from '@/lib/use-dark'

const dark = useDark()
</script>

<template>
  <StarsBackground
    :star-color="dark ? '#fff' : '#000'"
    class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#f5f5f5_0%,#fff_100%)] dark:bg-[radial-gradient(ellipse_at_bottom,#262626_0%,#000_100%)]"
  />
</template>
