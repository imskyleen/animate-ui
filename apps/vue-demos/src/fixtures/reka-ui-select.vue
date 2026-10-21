<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '@animate-ui/vue/primitives/reka-ui'
import { AnimateUIProvider } from '@animate-ui/vue/provider'

const FRUITS = ['Apple', 'Banana', 'Cherry']

const open = ref(false)
const value = ref('banana')
const forceMounted = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section data-testid="controlled" class="flex items-center gap-4">
      <p data-testid="controlled-open">
        {{ open ? 'open' : 'closed' }}
      </p>
      <p data-testid="controlled-value">
        {{ value }}
      </p>
      <SelectRoot v-model:open="open" v-model="value">
        <SelectTrigger aria-label="Controlled">
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent
            position="popper"
            data-testid="controlled-content"
            class="bg-white"
          >
            <SelectViewport>
              <SelectItem
                v-for="fruit in FRUITS"
                :key="fruit"
                :value="fruit.toLowerCase()"
              >
                <SelectItemText>Controlled {{ fruit }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
      <button type="button" @click="open = true">
        Open from outside
      </button>
    </section>

    <section data-testid="item-aligned">
      <SelectRoot default-value="cherry">
        <SelectTrigger aria-label="Aligned">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent data-testid="aligned-content" class="bg-white">
            <SelectViewport>
              <SelectItem
                v-for="fruit in FRUITS"
                :key="fruit"
                :value="fruit.toLowerCase()"
              >
                <SelectItemText>Aligned {{ fruit }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </section>

    <section data-testid="custom-transition">
      <SelectRoot default-value="apple">
        <SelectTrigger aria-label="Instant">
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent
            position="popper"
            data-testid="instant-content"
            :transition="{ duration: 0 }"
            :exit-transition="{ duration: 0 }"
          >
            <SelectViewport>
              <SelectItem
                v-for="fruit in FRUITS"
                :key="fruit"
                :value="fruit.toLowerCase()"
              >
                <SelectItemText>Instant {{ fruit }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </section>

    <section data-testid="force-mount">
      <button type="button" @click="forceMounted = true">
        Mount forceMount
      </button>
      <SelectRoot v-if="forceMounted" default-value="apple">
        <SelectTrigger aria-label="Force mounted">
          <SelectValue />
        </SelectTrigger>
        <SelectPortal force-mount>
          <SelectContent position="popper" data-testid="forced-content">
            <SelectViewport>
              <SelectItem
                v-for="fruit in FRUITS"
                :key="fruit"
                :value="fruit.toLowerCase()"
              >
                <SelectItemText>Forced {{ fruit }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </section>

    <section data-testid="own-animation">
      <AnimateUIProvider check-animation="pop">
        <SelectRoot default-value="apple">
          <SelectTrigger aria-label="Own animation">
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent position="popper" class="bg-white">
              <SelectViewport>
                <SelectItem
                  v-for="fruit in FRUITS"
                  :key="fruit"
                  :value="fruit.toLowerCase()"
                >
                  <span>
                    <SelectItemIndicator animation="draw">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M5 12l5 5L20 7"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </svg>
                    </SelectItemIndicator>
                  </span>
                  <SelectItemText>Own {{ fruit }}</SelectItemText>
                </SelectItem>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </SelectRoot>
      </AnimateUIProvider>
    </section>
  </div>
</template>
