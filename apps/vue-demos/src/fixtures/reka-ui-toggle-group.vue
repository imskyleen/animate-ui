<script setup lang="ts">
import { ref } from 'vue'
import { ToggleGroupItem, ToggleGroupRoot } from '@animate-ui/vue/primitives/reka-ui'

const value = ref('a')
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="controlled">
      <p data-testid="controlled-value">{{ value || 'none' }}</p>
      <button type="button" @click="value = 'a'">Select a</button>
      <ToggleGroupRoot v-model="value" type="single" aria-label="Controlled">
        <ToggleGroupItem value="a">Controlled a</ToggleGroupItem>
        <ToggleGroupItem value="b">Controlled b</ToggleGroupItem>
      </ToggleGroupRoot>
    </section>

    <section data-testid="multiple">
      <ToggleGroupRoot type="multiple" aria-label="Multiple" :default-value="['x']">
        <ToggleGroupItem value="x">Multiple x</ToggleGroupItem>
        <ToggleGroupItem value="y">Multiple y</ToggleGroupItem>
      </ToggleGroupRoot>
    </section>
  </div>
</template>
