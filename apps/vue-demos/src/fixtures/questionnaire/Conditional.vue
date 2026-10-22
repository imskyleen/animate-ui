<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/components/ui/questionnaire'

const runtime = ref('local')
const items = computed(() => [
  { name: 'runtime', required: true },
  { disabled: runtime.value !== 'cloud', name: 'environment', required: true },
  { name: 'approval', required: true },
])
</script>

<template>
  <Questionnaire default-item="runtime" :items="items">
    <QuestionnaireProgress />
    <QuestionnaireItem name="runtime" required>
      <QuestionnaireTitle>Where should it run?</QuestionnaireTitle>
      <QuestionnaireDescription>Cloud adds an environment question.</QuestionnaireDescription>
      <QuestionnaireChoices>
        <QuestionnaireChoice :checked="runtime === 'local'" value="local" @change="runtime = 'local'">
          Local
        </QuestionnaireChoice>
        <QuestionnaireChoice :checked="runtime === 'cloud'" value="cloud" @change="runtime = 'cloud'">
          Cloud
        </QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireItem :disabled="runtime !== 'cloud'" name="environment" required>
      <QuestionnaireTitle>Which environment?</QuestionnaireTitle>
      <QuestionnaireChoices>
        <QuestionnaireChoice value="preview">
          Preview
        </QuestionnaireChoice>
        <QuestionnaireChoice value="staging">
          Staging
        </QuestionnaireChoice>
        <QuestionnaireChoice value="isolated">
          Isolated
        </QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireItem name="approval" required>
      <QuestionnaireTitle>When to ask?</QuestionnaireTitle>
      <QuestionnaireChoices>
        <QuestionnaireChoice value="writes">
          Before writes
        </QuestionnaireChoice>
        <QuestionnaireChoice value="commands">
          Before commands
        </QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireActions>
      <QuestionnairePrevious />
      <QuestionnaireNext />
      <QuestionnaireSubmit />
    </QuestionnaireActions>
  </Questionnaire>
</template>
