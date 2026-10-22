<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'cn'
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    hexagonProps?: { class?: HTMLAttributes['class'], style?: Record<string, string | number> } & Record<string, unknown>
    hexagonSize?: number
    hexagonMargin?: number
  }>(),
  { hexagonSize: 75, hexagonMargin: 3 },
)

const range = (length: number) => Array.from({ length }, (_, i) => i)

const HEXAGON_CLASSES = [
  'relative',
  '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]',
  "before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full dark:before:bg-neutral-950 before:bg-white before:opacity-100 before:transition-colors before:duration-1000",
  "after:content-[''] after:absolute after:inset-[var(--hexagon-margin)] dark:after:bg-neutral-950 after:bg-white",
  'after:[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]',
  'hover:before:bg-neutral-200 dark:hover:before:bg-neutral-800 hover:before:opacity-100 hover:before:duration-0 dark:hover:after:bg-neutral-900 hover:after:bg-neutral-100 hover:after:opacity-100 hover:after:duration-0',
]

const hexagonWidth = computed(() => props.hexagonSize)
const hexagonHeight = computed(() => props.hexagonSize * 1.1)
// Rows a slanted side apart, so every border is hexagonMargin thick.
const rowSpacing = computed(() => {
  const corner = hexagonHeight.value / 4
  const side = Math.hypot(corner, hexagonWidth.value / 2)
  return hexagonHeight.value - corner + (props.hexagonMargin * (2 * side - corner)) / hexagonWidth.value
})
const computedMarginTop = computed(() => rowSpacing.value - hexagonHeight.value)
const oddRowMarginLeft = computed(() => -(props.hexagonSize / 2))
const evenRowMarginLeft = computed(() => props.hexagonMargin / 2)

const container = shallowRef<HTMLElement | null>(null)
const grid = reactive({ rows: 0, columns: 0 })

let stop = () => {}
watch(
  [container, rowSpacing, hexagonWidth],
  ([el, spacing, width]) => {
    stop()
    if (!el) return
    const update = () => {
      const { width: w, height: h } = el.getBoundingClientRect()
      const rows = Math.ceil(h / spacing) + 1
      const columns = Math.ceil(w / width) + 1
      if (grid.rows !== rows) grid.rows = rows
      if (grid.columns !== columns) grid.columns = columns
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    stop = () => observer.disconnect()
  },
  { immediate: true, flush: 'post' },
)
onBeforeUnmount(() => stop())

const hexagonAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.hexagonProps ?? {}
  return rest
})
</script>

<template>
  <div
    ref="container"
    data-slot="hexagon-background"
    :class="cn('relative isolate size-full overflow-hidden dark:bg-neutral-900 bg-neutral-100', props.class)"
    v-bind="$attrs"
    :style="{ '--hexagon-margin': `${hexagonMargin}px` }"
  >
    <div
      aria-hidden="true"
      class="absolute top-0 left-0 -z-10 size-full overflow-hidden text-base leading-6"
    >
      <div
        v-for="rowIndex in range(grid.rows)"
        :key="rowIndex"
        :style="{
          marginTop: `${computedMarginTop}px`,
          marginLeft: `${((rowIndex + 1) % 2 === 0 ? evenRowMarginLeft : oddRowMarginLeft) - 10}px`,
        }"
        class="flex w-max"
      >
        <div
          v-for="colIndex in range(grid.columns)"
          :key="colIndex"
          v-bind="hexagonAttrs"
          :style="[
            { width: `${hexagonWidth}px`, height: `${hexagonHeight}px`, marginLeft: `${hexagonMargin}px` },
            hexagonProps?.style,
          ]"
          :class="cn(HEXAGON_CLASSES, hexagonProps?.class)"
        />
      </div>
    </div>
    <slot />
  </div>
</template>
