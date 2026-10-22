<script setup lang="ts">
import BubbleBackground from '../../../../v2/registry/vue/backgrounds/bubble/BubbleBackground.vue'

withDefaults(defineProps<{ interactive?: boolean | string }>(), { interactive: true })
</script>

<template>
  <BubbleBackground :interactive="interactive === true || interactive === 'true'" class="absolute inset-0" />
</template>
