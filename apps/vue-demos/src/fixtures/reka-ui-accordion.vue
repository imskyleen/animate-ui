<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const value = ref<string | undefined>('a')
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="controlled">
      <p data-testid="controlled-value">{{ value || 'none' }}</p>
      <AccordionRoot v-model="value" type="single" collapsible>
        <AccordionItem v-for="item in ['a', 'b']" :key="item" :value="item">
          <AccordionHeader>
            <AccordionTrigger>Controlled {{ item }}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Controlled content {{ item }}</AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </section>

    <section data-testid="multiple">
      <AccordionRoot type="multiple" :default-value="['x']">
        <AccordionItem v-for="item in ['x', 'y']" :key="item" :value="item">
          <AccordionHeader>
            <AccordionTrigger>Multiple {{ item }}</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Multiple content {{ item }}</AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </section>

    <section data-testid="force-mount">
      <AccordionRoot type="single" collapsible>
        <AccordionItem value="f">
          <AccordionHeader>
            <AccordionTrigger>Force mounted</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent force-mount>
            <button type="button">Hidden button</button>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </section>
  </div>
</template>
