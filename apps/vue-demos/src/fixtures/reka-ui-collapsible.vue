<script setup lang="ts">
import { ref } from 'vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const open = ref(true)
</script>

<template>
  <div class="flex flex-col gap-10">
    <section>
      <p data-testid="controlled-open">{{ String(open) }}</p>
      <CollapsibleRoot v-model:open="open">
        <CollapsibleTrigger>Controlled</CollapsibleTrigger>
        <CollapsibleContent>Controlled content</CollapsibleContent>
      </CollapsibleRoot>
      <button type="button" @click="open = !open">Toggle from outside</button>
    </section>

    <section>
      <CollapsibleRoot default-open>
        <CollapsibleTrigger>Uncontrolled</CollapsibleTrigger>
        <CollapsibleContent>Uncontrolled content</CollapsibleContent>
      </CollapsibleRoot>
    </section>

    <section>
      <CollapsibleRoot>
        <CollapsibleTrigger>Force mounted</CollapsibleTrigger>
        <CollapsibleContent force-mount>
          <button type="button">Hidden button</button>
        </CollapsibleContent>
      </CollapsibleRoot>
    </section>

    <section>
      <CollapsibleRoot disabled>
        <CollapsibleTrigger>Disabled</CollapsibleTrigger>
        <CollapsibleContent>Disabled content</CollapsibleContent>
      </CollapsibleRoot>
    </section>
  </div>
</template>
