<script setup lang="ts">
import { ref } from 'vue'
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from '@animate-ui/vue/primitives/reka-ui'

const item = 'grid size-5 place-content-center rounded-full border'
const shown = ref(false)
const value = ref('a')
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="mounted">
      <button type="button" @click="shown = true">Show checked</button>
      <RadioGroupRoot v-if="shown" aria-label="Mounted" default-value="a">
        <RadioGroupItem
          v-for="v in ['a', 'b']"
          :key="v"
          :value="v"
          :aria-label="`Mounted ${v}`"
          :class="item"
        >
          <RadioGroupIndicator
            :data-testid="v === 'a' ? 'mounted-indicator' : undefined"
          >
            <svg viewBox="0 0 8 8" class="size-2">
              <circle cx="4" cy="4" r="4" fill="currentColor" />
            </svg>
          </RadioGroupIndicator>
        </RadioGroupItem>
      </RadioGroupRoot>
    </section>

    <section data-testid="controlled">
      <p data-testid="controlled-value">{{ value }}</p>
      <button type="button" @click="value = 'a'">Select a</button>
      <RadioGroupRoot v-model="value" aria-label="Controlled">
        <RadioGroupItem
          v-for="v in ['a', 'b']"
          :key="v"
          :value="v"
          :aria-label="`Controlled ${v}`"
          :class="item"
        >
          <RadioGroupIndicator :data-testid="`controlled-indicator-${v}`">
            <span>•</span>
          </RadioGroupIndicator>
        </RadioGroupItem>
      </RadioGroupRoot>
    </section>

    <section data-testid="force-mount">
      <RadioGroupRoot aria-label="Force mounted" default-value="1">
        <RadioGroupItem
          v-for="v in ['1', '2']"
          :key="v"
          :value="v"
          :aria-label="`Forced ${v}`"
          :class="item"
        >
          <RadioGroupIndicator
            force-mount
            :data-testid="`forced-indicator-${v}`"
          >
            <span :data-testid="`forced-dot-${v}`">•</span>
          </RadioGroupIndicator>
        </RadioGroupItem>
      </RadioGroupRoot>
    </section>

    <section data-testid="as-child">
      <RadioGroupRoot aria-label="As child" default-value="x">
        <RadioGroupItem value="x" as-child>
          <span role="radio" aria-label="Child x" :class="item" />
        </RadioGroupItem>
      </RadioGroupRoot>
    </section>
  </div>
</template>
