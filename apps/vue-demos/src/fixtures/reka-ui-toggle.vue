<script setup lang="ts">
import { ref } from 'vue'
import { Toggle } from '@animate-ui/vue/primitives/reka-ui'

const pressed = ref(false)
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex items-center gap-3">
      <Toggle v-model="pressed" aria-label="Controlled">B</Toggle>
      <p data-testid="controlled-value">{{ String(pressed) }}</p>
      <button type="button" @click="pressed = true">Press it</button>
    </section>
    <section>
      <Toggle :default-value="true" aria-label="Uncontrolled">I</Toggle>
    </section>
    <section data-testid="as-child">
      <Toggle as-child>
        <a href="#toggle">Link</a>
      </Toggle>
    </section>
  </div>
</template>
