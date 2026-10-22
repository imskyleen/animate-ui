<script setup lang="ts">
import GlyphBackground from '../../../../v2/registry/vue/backgrounds/glyph/GlyphBackground.vue'

withDefaults(
  defineProps<{
    glowColor?: string
    shapeColor?: string
    fontSize?: number | string
    interactive?: boolean | string
  }>(),
  { glowColor: '', shapeColor: '', fontSize: 10, interactive: true },
)
</script>

<template>
  <GlyphBackground
    class="absolute inset-0 bg-white text-neutral-900 dark:bg-[#121212] dark:text-white"
    :glow-color="glowColor || undefined"
    :shape-color="shapeColor || undefined"
    :font-size="Number(fontSize)"
    :interactive="interactive === true || interactive === 'true'"
  />
</template>
