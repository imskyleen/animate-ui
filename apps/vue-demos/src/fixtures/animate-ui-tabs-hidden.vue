<script setup lang="ts">
import { ref } from 'vue'
import Example from './animate-ui-tabs-hidden-example.vue'

const shown = ref(false)
const loaded = ref(false)
</script>

<template>
  <div>
    <button type="button" @click="shown = true">
      Show
    </button>
    <button type="button" @click="loaded = true">
      Load
    </button>
    <div :hidden="!shown" class="flex flex-col gap-10">
      <Example id="tallest" default-value="two" />
      <Example id="shorter" default-value="one" />
    </div>
    <Example id="no-default" />
    <Example id="empty" default-value="one" late :loaded="loaded" />
  </div>
</template>
