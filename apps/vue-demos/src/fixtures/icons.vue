<script setup lang="ts">
import { AnimateIcon } from '@animate-ui/vue/icons'
import { ref } from 'vue'
import Bell from '../../../v2/registry/vue/icons/bell/Bell.vue'
import CirclePlus from '../../../v2/registry/vue/icons/circle-plus/CirclePlus.vue'
import Fingerprint from '../../../v2/registry/vue/icons/fingerprint/Fingerprint.vue'
import PanelLeft from '../../../v2/registry/vue/icons/panel-left/PanelLeft.vue'
import RefreshCw from '../../../v2/registry/vue/icons/refresh-cw/RefreshCw.vue'
import NoRef from './icons-no-ref.vue'

const play = ref(false)
const delayed = ref(false)
const drawn = ref(false)
const panel = ref(true)
const viewRef = ref(null)
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section data-testid="loop-turn">
      <AnimateIcon animate loop :loop-delay="300" animation="rotate">
        <RefreshCw :size="48" />
      </AnimateIcon>
    </section>
    <section data-testid="loop-no-ref">
      <AnimateIcon as-child animate loop :loop-delay="200" animation="rotate">
        <NoRef>
          <RefreshCw :size="48" />
        </NoRef>
      </AnimateIcon>
    </section>
    <section data-testid="mounted-animated">
      <PanelLeft :animate="panel" :initial="false" :size="48" />
      <button type="button" @click="panel = !panel">
        Toggle panel
      </button>
    </section>
    <section data-testid="hover">
      <Bell animate-on-hover :size="48" />
    </section>
    <section data-testid="tap">
      <Bell animate-on-tap :size="48" />
    </section>
    <section data-testid="tap-complete">
      <Bell animate-on-tap complete-on-stop :size="48" />
    </section>
    <section data-testid="speed" class="flex items-center gap-4">
      <button type="button" @click="play = true">
        Play
      </button>
      <Bell data-speed="1" :animate="play" :size="48" />
      <Bell data-speed="2" :animate="play" :speed="2" :size="48" />
    </section>
    <AnimateIcon animate-on-hover data-testid="group-override">
      <span class="inline-flex p-2">
        <Bell :speed="1.5" :size="48" />
      </span>
    </AnimateIcon>
    <section data-testid="group-delay" class="flex items-center gap-4">
      <button type="button" @click="delayed = true">
        Play delayed
      </button>
      <AnimateIcon :animate="delayed" :delay="400">
        <span class="inline-flex p-2">
          <Bell :speed="1" :size="48" />
        </span>
      </AnimateIcon>
    </section>
    <section data-testid="path" class="flex items-center gap-4">
      <button type="button" @click="drawn = true">
        Draw
      </button>
      <CirclePlus :animate="drawn" animation="path" :size="48" />
      <Fingerprint :size="48" />
    </section>
    <section data-testid="tap-loop">
      <Bell animate-on-tap loop :size="48" />
    </section>
    <div class="h-[1500px]" />
    <AnimateIcon
      ref="viewRef"
      animate-on-view
      data-testid="view-ref"
      class="inline-flex"
    >
      <Bell :size="48" />
    </AnimateIcon>
  </div>
</template>
