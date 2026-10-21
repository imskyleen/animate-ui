<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { ProgressIndicator, ProgressRoot } from '@animate-ui/vue/primitives/reka-ui'

const track = { width: '200px', height: '8px', overflow: 'hidden', background: '#ddd' }
const bar = { height: '100%', background: 'black' }
const STEPS = [12, 27, 41, 58, 64, 83, 100]

const value = ref(25)
const upload = ref(64)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function start() {
  upload.value = 0
  running.value = true
  let step = 0
  timer = setInterval(() => {
    upload.value = STEPS[step]!
    step += 1
    if (step === STEPS.length) {
      clearInterval(timer)
      running.value = false
    }
  }, 450)
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="flex flex-col gap-10">
    <button type="button" @click="value = 50">Complete</button>

    <ProgressRoot :model-value="value" :max="50" aria-label="Main" :style="track">
      <ProgressIndicator
        data-testid="main-indicator"
        :style="{ ...bar, transform: `translateX(-${100 - value * 2}%)` }"
      />
    </ProgressRoot>

    <ProgressRoot :model-value="null" aria-label="Loading" :style="track">
      <ProgressIndicator :style="bar" />
    </ProgressRoot>

    <ProgressRoot :model-value="value" :max="50" aria-label="Slow" :style="track">
      <ProgressIndicator
        data-testid="slow-indicator"
        :transition="{ duration: 1.5, ease: 'linear' }"
        :style="{ ...bar, transform: `translateX(-${100 - value * 2}%)` }"
      />
    </ProgressRoot>

    <section>
      <button type="button" :disabled="running" @click="start">Upload again</button>
      <ProgressRoot :model-value="upload" aria-label="Upload" :style="track">
        <ProgressIndicator
          data-testid="upload-indicator"
          :style="{ ...bar, transform: `translateX(-${100 - upload}%)` }"
        />
      </ProgressRoot>
    </section>
  </div>
</template>
