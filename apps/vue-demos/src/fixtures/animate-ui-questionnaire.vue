<script setup lang="ts">
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import { QuestionnaireProgress } from '@/components/ui/questionnaire'
import Conditional from './questionnaire/Conditional.vue'
import Controlled from './questionnaire/Controlled.vue'
import Flow from './questionnaire/Flow.vue'
import NavigationState from './questionnaire/NavigationState.vue'
import { COLOR, SIZE } from './questionnaire/questions'
import Submitted from './questionnaire/Submitted.vue'
</script>

<template>
  <div class="flex w-[448px] flex-col gap-16">
    <section data-testid="controlled">
      <Controlled />
    </section>
    <section data-testid="resume">
      <Flow default-item="extras" :defaults="{ color: ['Green'], extras: ['Olives'] }" />
    </section>
    <section data-testid="custom-progress">
      <Flow>
        <template #progress>
          <QuestionnaireProgress v-slot="{ current, total }">
            Step {{ current }}/{{ total }}
          </QuestionnaireProgress>
        </template>
      </Flow>
    </section>
    <section data-testid="tempo">
      <AnimateUIProvider :tempo="2">
        <Flow />
      </AnimateUIProvider>
    </section>
    <section data-testid="reset">
      <Flow />
    </section>
    <section data-testid="submit">
      <Submitted />
    </section>
    <section data-testid="rtl" dir="rtl">
      <Flow />
    </section>
    <section data-testid="progress-in-items">
      <Flow progress-in-items />
    </section>
    <section data-testid="navigation-state">
      <NavigationState />
    </section>
    <section data-testid="inline-styles">
      <Flow
        :style="{ position: 'static' }"
        :item-props="(question) => question.name === 'color' ? { style: { width: '400px', marginBottom: '6px' } } : {}"
        :actions-props="{ style: { position: 'static' } }"
        :next-props="{ style: { width: '120px' } }"
      />
    </section>
    <section data-testid="content-box">
      <Flow :item-props="() => ({ class: 'box-content border-2 border-border p-3.5' })" />
    </section>
    <section data-testid="fractional" style="width: 400.39px">
      <Flow />
    </section>
    <section data-testid="jump-back">
      <Flow :questions="[COLOR, SIZE]" default-item="size" :defaults="{ size: ['Large'] }" />
    </section>
    <section data-testid="conditional">
      <Conditional />
    </section>
  </div>
</template>
