<script setup lang="ts">
import type { AnimationPlaybackControls } from 'motion-v'
import { AnimateView } from 'motion-v'
import { onMounted, onUpdated, shallowRef } from 'vue'
import { morphRadius, radii, SHARE } from './effects'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ name: string }>()

const element = shallowRef<HTMLElement | null>(null)
let from: string | undefined

function remember() {
  if (!element.value)
    return
  from = radii.get(props.name)
  radii.set(props.name, getComputedStyle(element.value).borderRadius)
}
onMounted(remember)
onUpdated(remember)

function onAnimationStart(_: AnimationPlaybackControls, type: string) {
  if (type === 'share' && element.value)
    morphRadius(props.name, from, getComputedStyle(element.value).borderRadius)
}
</script>

<template>
  <AnimateView :name="props.name" :transition="SHARE" :on-animation-start="onAnimationStart">
    <div
      ref="element"
      data-slot="page-transition-shared"
      v-bind="$attrs"
      :style="{ viewTransitionClass: 'page-transition-shared' }"
    />
  </AnimateView>
</template>
