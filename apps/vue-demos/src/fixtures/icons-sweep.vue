<script setup lang="ts">
import type { Component } from 'vue'
import { onMounted, ref, shallowRef } from 'vue'
import { icons } from '../icons'

const props = withDefaults(defineProps<{ lib?: string }>(), { lib: 'lucide' })

type Entry = { name: string, Icon: Component, animations: string[] }

const entries = shallowRef<Entry[] | null>(null)
const play = ref(false)

onMounted(async () => {
  const names = Object.keys(icons).filter(key => key.startsWith(`${props.lib}/`))
  entries.value = await Promise.all(
    names.map(async (key) => {
      const mod = (await icons[key]!()) as { default: Component, animations: Record<string, unknown> }
      return { name: key.slice(props.lib.length + 1), Icon: mod.default, animations: Object.keys(mod.animations) }
    }),
  )
})
</script>

<template>
  <div>
    <button type="button" @click="play = !play">
      Play
    </button>
    <div v-if="entries" data-testid="ready" class="flex flex-wrap gap-2">
      <template v-for="entry in entries" :key="entry.name">
        <span
          v-for="animation in entry.animations"
          :key="`${entry.name}:${animation}`"
          :data-icon="`${entry.name}:${animation}`"
          class="inline-flex"
        >
          <component :is="entry.Icon" :size="32" :animate="play" :animation="animation" />
        </span>
      </template>
    </div>
  </div>
</template>
