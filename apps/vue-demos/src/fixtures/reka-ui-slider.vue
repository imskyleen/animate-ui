<script setup lang="ts">
import { ref } from 'vue'
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '@animate-ui/vue/primitives/reka-ui'
import { Slider as DemoSlider } from '@/components/ui/slider'

const root = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '240px',
  height: '20px',
  touchAction: 'none',
} as const
const track = {
  position: 'relative',
  flexGrow: 1,
  height: '4px',
  background: '#ddd',
} as const
const range = {
  position: 'absolute',
  height: '100%',
  background: 'black',
} as const
const thumb = {
  display: 'block',
  width: '16px',
  height: '16px',
  borderRadius: '8px',
  background: 'black',
} as const

const value = ref([20])
const committed = ref<number[]>([])
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="controlled">
      <p data-testid="value">
        {{ value.join(',') }}
      </p>
      <p data-testid="committed">
        {{ committed.join(',') }}
      </p>
      <button type="button" @click="value = [80]">
        Set 80
      </button>
      <SliderRoot
        v-model="value"
        :style="root"
        @value-commit="(next: number[]) => (committed = next)"
      >
        <SliderTrack :style="track">
          <SliderRange :style="range" />
        </SliderTrack>
        <SliderThumb aria-label="Controlled" :style="thumb" />
      </SliderRoot>
    </section>

    <section data-testid="star">
      <SliderRoot :default-value="[10, 60]" :style="root">
        <SliderTrack :style="track">
          <SliderRange :style="range" />
        </SliderTrack>
        <SliderThumb :style="thumb" />
        <SliderThumb :style="thumb" />
      </SliderRoot>
    </section>

    <section data-testid="disabled">
      <SliderRoot :default-value="[50]" disabled :style="root">
        <SliderTrack :style="track">
          <SliderRange :style="range" />
        </SliderTrack>
        <SliderThumb aria-label="Disabled" :style="thumb" />
      </SliderRoot>
    </section>

    <section data-testid="range">
      <DemoSlider
        :default-value="[25, 50]"
        :max="100"
        :step="5"
        class="mx-auto w-full max-w-xs"
      />
    </section>
  </div>
</template>
