<script setup lang="ts">
import { ref } from 'vue'
import { SwitchRoot, SwitchThumb } from '@animate-ui/vue/primitives/reka-ui'

const checked = ref(false)
const thumb =
  'block size-4 rounded-full bg-background data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
const track =
  'inline-flex h-[1.15rem] w-8 items-center rounded-full border border-transparent data-[state=checked]:bg-primary data-[state=unchecked]:bg-input'
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex items-center gap-3">
      <SwitchRoot v-model="checked" aria-label="Controlled" :class="track">
        <SwitchThumb :class="thumb" />
      </SwitchRoot>
      <p data-testid="controlled-value">{{ String(checked) }}</p>
      <button type="button" @click="checked = true">Turn on</button>
    </section>

    <section>
      <SwitchRoot :default-value="true" aria-label="Uncontrolled" :class="track">
        <SwitchThumb data-testid="uncontrolled-thumb" :class="thumb" />
      </SwitchRoot>
    </section>

    <form>
      <SwitchRoot disabled name="airplane" aria-label="In a form" :class="track">
        <SwitchThumb :class="thumb" />
      </SwitchRoot>
    </form>

    <section>
      <SwitchRoot aria-label="Leftover transition" :class="track">
        <SwitchThumb :class="`${thumb} transition-transform duration-200`" />
      </SwitchRoot>
    </section>
  </div>
</template>
