<script setup lang="ts">
import { ref } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxViewport,
} from '@animate-ui/vue/primitives/reka-ui'

const FRUITS = ['Apple', 'Banana', 'Cherry']
const open = ref(false)
const value = ref('banana')
const many = ref<string[]>(['apple'])
</script>

<template>
  <div class="flex flex-col items-start gap-10 p-4">
    <section data-testid="controlled" class="flex items-center gap-4">
      <p data-testid="controlled-open">
        {{ open ? 'open' : 'closed' }}
      </p>
      <p data-testid="controlled-value">
        {{ value }}
      </p>
      <ComboboxRoot v-model:open="open" v-model="value">
        <ComboboxAnchor>
          <ComboboxInput aria-label="Controlled" />
        </ComboboxAnchor>
        <ComboboxPortal>
          <ComboboxContent position="popper" data-testid="controlled-content" class="bg-white">
            <ComboboxViewport>
              <ComboboxItem v-for="fruit in FRUITS" :key="fruit" :value="fruit.toLowerCase()">
                Controlled {{ fruit }}
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>
      <button type="button" @click="open = true">
        Open from outside
      </button>
    </section>

    <section data-testid="multiple">
      <p data-testid="multiple-value">
        {{ many.join(',') }}
      </p>
      <ComboboxRoot v-model="many" multiple>
        <ComboboxAnchor>
          <ComboboxInput aria-label="Multiple" />
        </ComboboxAnchor>
        <ComboboxPortal>
          <ComboboxContent position="popper" data-testid="multiple-content" class="bg-white">
            <ComboboxViewport>
              <ComboboxItem v-for="fruit in FRUITS" :key="fruit" :value="fruit.toLowerCase()">
                <ComboboxItemIndicator>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="2" />
                  </svg>
                </ComboboxItemIndicator>
                Many {{ fruit }}
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>
    </section>

    <section data-testid="custom-transition">
      <ComboboxRoot>
        <ComboboxAnchor>
          <ComboboxInput aria-label="Instant" />
        </ComboboxAnchor>
        <ComboboxPortal>
          <ComboboxContent
            position="popper"
            data-testid="instant-content"
            :transition="{ duration: 0 }"
            :exit-transition="{ duration: 0 }"
          >
            <ComboboxViewport>
              <ComboboxItem v-for="fruit in FRUITS" :key="fruit" :value="fruit.toLowerCase()">
                Instant {{ fruit }}
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>
    </section>
  </div>
</template>
