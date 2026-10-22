<script setup lang="ts">
import type { QuestionnaireItemStatus } from '@/components/ui/questionnaire'
import type { Question } from './questions'
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
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from '@/components/ui/questionnaire'
import { QUESTIONS } from './questions'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    defaults?: Record<string, string[]>
    questions?: Question[]
    progressInItems?: boolean
    itemProps?: (question: Question) => Record<string, unknown>
    actionsProps?: Record<string, unknown>
    nextProps?: Record<string, unknown>
    submitProps?: Record<string, unknown>
  }>(),
  { defaults: () => ({}), questions: () => QUESTIONS, progressInItems: false },
)

const emit = defineEmits<{ status: [name: string, status: QuestionnaireItemStatus] }>()
</script>

<template>
  <Questionnaire v-bind="$attrs">
    <template v-if="!props.progressInItems">
      <slot name="progress">
        <QuestionnaireProgress />
      </slot>
    </template>
    <QuestionnaireItem
      v-for="question in props.questions"
      :key="question.name"
      :name="question.name"
      :required="question.required"
      :multiple="question.multiple"
      v-bind="props.itemProps?.(question) ?? {}"
      @update:status="(status) => emit('status', question.name, status)"
    >
      <QuestionnaireTitle>{{ question.title }}</QuestionnaireTitle>
      <QuestionnaireProgress v-if="props.progressInItems" />
      <QuestionnaireDescription v-if="question.description">
        {{ question.description }}
      </QuestionnaireDescription>
      <QuestionnaireChoices>
        <QuestionnaireChoice
          v-for="choice in question.choices"
          :key="choice"
          :value="choice.toLowerCase()"
          :default-checked="props.defaults[question.name]?.includes(choice)"
        >
          {{ choice }}
        </QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireActions v-bind="props.actionsProps ?? {}">
      <QuestionnairePrevious />
      <QuestionnaireSkip />
      <QuestionnaireNext v-bind="props.nextProps ?? {}" />
      <QuestionnaireSubmit v-bind="props.submitProps ?? {}" />
    </QuestionnaireActions>
  </Questionnaire>
</template>
