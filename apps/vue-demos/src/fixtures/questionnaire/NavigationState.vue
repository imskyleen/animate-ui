<script setup lang="ts">
import type { QuestionnaireItemStatus } from '@/components/ui/questionnaire'
import { computed, ref } from 'vue'
import Flow from './Flow.vue'
import { COLOR, SIZE } from './questions'

const item = ref('color')
const statuses = ref<Record<string, QuestionnaireItemStatus>>({ color: 'unanswered', size: 'unanswered' })
const unanswered = computed(() => statuses.value[item.value] === 'unanswered')

function onStatus(name: string, status: QuestionnaireItemStatus) {
  statuses.value = { ...statuses.value, [name]: status }
}
</script>

<template>
  <Flow
    :questions="[COLOR, SIZE]"
    :item="item"
    :next-props="{ class: 'data-[status=unanswered]:opacity-50', disabled: unanswered, variant: 'secondary' }"
    :submit-props="{ disabled: unanswered }"
    @update:item="item = $event"
    @status="onStatus"
  />
  <div class="mt-4 flex gap-2">
    <button v-for="question in [COLOR, SIZE]" :key="question.name" type="button" @click="item = question.name">
      Go to {{ question.name }}
    </button>
  </div>
</template>
