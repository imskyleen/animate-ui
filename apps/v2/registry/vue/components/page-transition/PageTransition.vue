<script setup lang="ts">
import type { Effect, Frame, PageTransitionEffect } from './effects'
import { useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { AnimateView } from 'motion-v'
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, shallowRef, useId, watch } from 'vue'
import { routeLocationKey } from 'vue-router'
import { backgroundOf, CLIP, clipRadius, EFFECTS, frameOf, pickEffect } from './effects'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{ effect?: PageTransitionEffect, pageKey?: string | number }>(),
  { effect: 'fade' },
)

const route = inject(routeLocationKey, null)
const key = computed(() => props.pageKey ?? route?.path)
const reduce = useShouldReduceMotion()
const element = shallowRef<HTMLElement | null>(null)
let point: { x: number, y: number } | undefined
let exit: Frame | undefined
let effect: Effect = 'fade'
const className = `page-transition-${useId().replace(/[^a-z0-9]/gi, '')}`

watch(
  [() => props.effect, key],
  () => {
    effect = props.effect === 'random' ? pickEffect(effect) : props.effect
  },
  { immediate: true, flush: 'pre' },
)

let style: HTMLStyleElement | null = null

function refreshStyle() {
  if (!element.value || !style)
    return
  style.textContent
    = `::view-transition-image-pair(*.${className}){border-radius:${clipRadius(element.value)}}`
      + `::view-transition-old(*.${className}),::view-transition-new(*.${className}){background-color:${backgroundOf(element.value)}}`
}

function onInput(event: Event) {
  if (!element.value)
    return
  point = event instanceof PointerEvent ? { x: event.clientX, y: event.clientY } : undefined
  exit = frameOf(element.value, point)
}

onMounted(() => {
  if (!document.getElementById('page-transition')) {
    const clip = document.createElement('style')
    clip.id = 'page-transition'
    clip.textContent = CLIP
    document.head.append(clip)
  }
  style = document.createElement('style')
  document.head.append(style)
  refreshStyle()
  document.addEventListener('pointerdown', onInput, true)
  document.addEventListener('keydown', onInput, true)
})
onUpdated(refreshStyle)
onBeforeUnmount(() => {
  style?.remove()
  document.removeEventListener('pointerdown', onInput, true)
  document.removeEventListener('keydown', onInput, true)
})

function animation(types: string[]) {
  refreshStyle()
  const named = types.find((type): type is Effect => type in EFFECTS)
  const enter = frameOf(element.value!, point)
  return EFFECTS[reduce.value ? 'fade' : (named ?? effect)](
    types.includes('nav-back'),
    enter,
    exit ?? enter,
  )
}
</script>

<template>
  <AnimateView
    :key="key"
    :enter="(types: string[]) => animation(types).enter"
    :exit="(types: string[]) => animation(types).exit"
  >
    <div
      ref="element"
      data-slot="page-transition"
      v-bind="$attrs"
      :style="{ viewTransitionClass: `page-transition ${className}` }"
    >
      <slot />
    </div>
  </AnimateView>
</template>
