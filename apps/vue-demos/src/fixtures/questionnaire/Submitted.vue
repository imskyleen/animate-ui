<script setup lang="ts">
import { ref } from 'vue'
import Flow from './Flow.vue'
import { QUESTIONS } from './questions'

const data = ref('')

function onSubmit(event: Event) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget as HTMLFormElement)
  data.value = JSON.stringify(
    Object.fromEntries(QUESTIONS.map(question => [question.name, formData.getAll(question.name)])),
  )
}
</script>

<template>
  <Flow @submit="onSubmit" />
  <pre data-testid="submit-data">{{ data }}</pre>
</template>
