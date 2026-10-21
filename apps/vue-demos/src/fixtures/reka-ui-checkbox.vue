<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckboxIndicator,
  CheckboxRoot,
  type CheckboxCheckedState,
} from '@animate-ui/vue/primitives/reka-ui'

const box = 'grid size-5 place-content-center border'
const shown = ref(false)
const checked = ref<CheckboxCheckedState>(false)
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="mounted">
      <button type="button" @click="shown = true">Show checked</button>
      <CheckboxRoot
        v-if="shown"
        aria-label="Mounted checked"
        :class="box"
        :default-value="true"
      >
        <CheckboxIndicator data-testid="mounted-indicator">
          <svg
            viewBox="0 0 24 24"
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
    </section>

    <section data-testid="controlled">
      <p data-testid="controlled-value">{{ String(checked) }}</p>
      <button type="button" @click="checked = 'indeterminate'">
        Set indeterminate
      </button>
      <CheckboxRoot v-model="checked" aria-label="Controlled" :class="box">
        <CheckboxIndicator data-testid="controlled-indicator">
          <span v-if="checked === 'indeterminate'" data-testid="dash">–</span>
          <span v-else>✓</span>
        </CheckboxIndicator>
      </CheckboxRoot>
    </section>

    <section data-testid="uncontrolled">
      <CheckboxRoot aria-label="Uncontrolled" :class="box" :default-value="true">
        <CheckboxIndicator data-testid="uncontrolled-indicator">
          <span>✓</span>
        </CheckboxIndicator>
      </CheckboxRoot>
    </section>

    <section data-testid="force-mount">
      <CheckboxRoot aria-label="Force mounted" :class="box">
        <CheckboxIndicator force-mount data-testid="forced-indicator">
          <span data-testid="forced-check">✓</span>
        </CheckboxIndicator>
      </CheckboxRoot>
    </section>

    <form data-testid="form">
      <CheckboxRoot
        aria-label="In a form"
        :class="box"
        name="newsletter"
        value="yes"
      >
        <CheckboxIndicator>
          <span>✓</span>
        </CheckboxIndicator>
      </CheckboxRoot>
    </form>
  </div>
</template>
