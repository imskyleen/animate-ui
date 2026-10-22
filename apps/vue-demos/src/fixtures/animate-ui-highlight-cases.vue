<script setup lang="ts">
import { Highlight, HighlightItem } from '@animate-ui/vue/primitives/effects/highlight'
import { onMounted, ref } from 'vue'

const bg = 'bg-black/10'
const log = ref<string[]>([])
const wide = ref(false)
const refTag = ref('')
const child = ref<HTMLButtonElement | null>(null)
const push = (entry: string) => log.value.push(entry)
onMounted(() => (refTag.value = child.value?.tagName ?? 'none'))
</script>

<template>
  <div class="flex flex-col items-start gap-6">
    <div data-testid="disabled-children">
      <Highlight :class="bg" default-value="a" disabled>
        <button data-value="a">
          Disabled A
        </button>
        <button data-value="b">
          Disabled B
        </button>
      </Highlight>
    </div>

    <div data-testid="disabled-parent">
      <Highlight mode="parent" :class="bg" default-value="a" disabled>
        <button data-value="a">
          Parent disabled A
        </button>
        <button data-value="b">
          Parent disabled B
        </button>
      </Highlight>
    </div>

    <Highlight :class="bg" controlled-items>
      <HighlightItem value="click" @click="push('item click')">
        <button style="color: rgb(255, 0, 0)" @click="push('child click')">
          Handlers
        </button>
      </HighlightItem>
    </Highlight>

    <Highlight mode="parent" :class="bg" controlled-items>
      <HighlightItem value="ref" as-child>
        <button ref="child">
          Ref
        </button>
      </HighlightItem>
    </Highlight>

    <div data-testid="resize">
      <Highlight mode="parent" :class="bg" default-value="grow">
        <button data-value="grow" :style="{ width: wide ? '240px' : '120px' }">
          Grow
        </button>
      </Highlight>
    </div>
    <button @click="wide = true">
      Widen
    </button>

    <output data-testid="log">{{ log.join(',') }}</output>
    <output data-testid="ref">{{ refTag }}</output>
  </div>
</template>
