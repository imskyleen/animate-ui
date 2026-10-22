<script setup lang="ts">
import { ref } from 'vue'
import Flow from './Flow.vue'
import { QUESTIONS } from './questions'

const item = ref('color')
const calls = ref<string[]>([])

function onItem(next: string) {
  calls.value = [...calls.value, next]
  item.value = next
}
</script>

<template>
  <Flow :item="item" @update:item="onItem" />
  <div class="mt-4 flex gap-2">
    <button v-for="question in QUESTIONS" :key="question.name" type="button" @click="item = question.name">
      Show {{ question.name }}
    </button>
  </div>
  <output data-testid="controlled-calls">{{ calls.join(',') }}</output>
</template>
