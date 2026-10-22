<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { SpringOptions, TargetAndTransition, Transition } from 'motion-v'
import { ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/vue/utils/motion'
import { usePageVisible } from '@animate-ui/vue/utils/use-page-visible'
import { cn } from 'cn'
import { motion, useInView, useMotionValue, useSpring } from 'motion-v'
import { computed, onBeforeUnmount, shallowRef, toRef, useId, watch } from 'vue'

type BubbleColors = {
  first: string
  second: string
  third: string
  fourth: string
  fifth: string
  sixth: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    interactive?: boolean
    transition?: SpringOptions
    colors?: BubbleColors
  }>(),
  {
    interactive: false,
    transition: () => ({ stiffness: 100, damping: 20 }),
    colors: () => ({
      first: '18,113,255',
      second: '221,74,255',
      third: '0,220,255',
      fourth: '200,50,50',
      fifth: '180,180,50',
      sixth: '140,100,255',
    }),
  },
)

function loop(
  playing: boolean,
  keyframes: TargetAndTransition,
  rest: TargetAndTransition,
  transition: Transition,
) {
  return playing
    ? { initial: rest, animate: keyframes, transition }
    : { initial: rest, animate: rest, transition: { duration: 0 } }
}

const spin = (from: number) => ({ rotate: [from, from + 360] })

const container = shallowRef<HTMLElement | null>(null)
const mouseX = useMotionValue(0)
const mouseY = useMotionValue(0)
const springX = useSpring(mouseX, toRef(props, 'transition'))
const springY = useSpring(mouseY, toRef(props, 'transition'))

const inView = useInView(container)
const pageVisible = usePageVisible()
const reduce = useShouldReduceMotion()
const playing = computed(() => inView.value && pageVisible.value && !reduce.value)

const filterId = `bubble-goo-${useId().replace(/[^\w-]/g, '')}`

let stop = () => {}
watch(
  [() => props.interactive, reduce, container],
  ([interactive, reduced, el]) => {
    stop()
    stop = () => {}
    if (!interactive || reduced || !el) return
    let frameId: number | null = null
    const handleMouseMove = (e: MouseEvent) => {
      if (frameId != null) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        frameId = null
        const rect = el.getBoundingClientRect()
        mouseX.set(e.clientX - (rect.left + rect.width / 2))
        mouseY.set(e.clientY - (rect.top + rect.height / 2))
      })
    }
    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    stop = () => {
      el.removeEventListener('mousemove', handleMouseMove)
      if (frameId != null) cancelAnimationFrame(frameId)
    }
  },
  { immediate: true, flush: 'post' },
)
onBeforeUnmount(() => stop())
</script>

<template>
  <ReducedMotionConfig>
    <div
      ref="container"
      data-slot="bubble-background"
      :class="cn('relative size-full overflow-hidden bg-gradient-to-br from-violet-900 to-blue-900', props.class)"
      v-bind="$attrs"
      :style="{
        '--first-color': colors.first,
        '--second-color': colors.second,
        '--third-color': colors.third,
        '--fourth-color': colors.fourth,
        '--fifth-color': colors.fifth,
        '--sixth-color': colors.sixth,
      }"
    >
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute top-0 left-0 w-0 h-0"
      >
        <defs>
          <filter :id="filterId">
            <feGaussianBlur in="SourceGraphic" std-deviation="16" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0"
        :style="{ filter: `url(#${filterId}) blur(40px)` }"
      >
        <motion.div
          class="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)]"
          v-bind="loop(playing, { y: [-50, 50, -50] }, { y: -50 }, { duration: 30, ease: 'easeInOut', repeat: Infinity })"
          :style="{ willChange: 'transform' }"
        />

        <motion.div
          class="absolute inset-0 flex justify-center items-center origin-[calc(50%-400px)]"
          v-bind="loop(playing, spin(0), { rotate: reduce ? 90 : 0 }, { duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'loop' })"
          :style="{ willChange: 'transform' }"
        >
          <div class="rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0%,rgba(var(--second-color),0)_50%)]" />
        </motion.div>

        <motion.div
          class="absolute inset-0 flex justify-center items-center origin-[calc(50%+400px)]"
          v-bind="loop(playing, spin(0), { rotate: reduce ? 180 : 0 }, { duration: 40, ease: 'linear', repeat: Infinity })"
          :style="{ willChange: 'transform' }"
        >
          <div class="absolute rounded-full size-[80%] bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0%,rgba(var(--third-color),0)_50%)] mix-blend-hard-light top-[calc(50%+200px)] left-[calc(50%-500px)]" />
        </motion.div>

        <motion.div
          class="absolute rounded-full size-[80%] top-[10%] left-[10%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fourth-color),0.8)_0%,rgba(var(--fourth-color),0)_50%)] opacity-70"
          v-bind="loop(playing, { x: [-50, 50, -50] }, { x: -50 }, { duration: 40, ease: 'easeInOut', repeat: Infinity })"
          :style="{ willChange: 'transform' }"
        />

        <motion.div
          class="absolute inset-0 flex justify-center items-center origin-[calc(50%_-_800px)_calc(50%_+_200px)]"
          v-bind="loop(playing, spin(0), { rotate: reduce ? 45 : 0 }, { duration: 20, ease: 'linear', repeat: Infinity })"
          :style="{ willChange: 'transform' }"
        >
          <div class="absolute rounded-full size-[160%] mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--fifth-color),0.8)_0%,rgba(var(--fifth-color),0)_50%)] top-[calc(50%-80%)] left-[calc(50%-80%)]" />
        </motion.div>

        <motion.div
          v-if="interactive"
          class="absolute rounded-full size-full mix-blend-hard-light bg-[radial-gradient(circle_at_center,rgba(var(--sixth-color),0.8)_0%,rgba(var(--sixth-color),0)_50%)] opacity-70"
          :style="{ x: springX, y: springY, willChange: 'transform' }"
        />
      </div>

      <slot />
    </div>
  </ReducedMotionConfig>
</template>
