import type { VariantProps } from 'class-variance-authority'
import type { Transition } from 'motion-v'
import type { Component, InjectionKey, PropType, Ref } from 'vue'
import { Button } from '@animate-ui/vue/primitives/buttons/button'
import { motionTokens, useShouldReduceMotion, useTempoTransition } from '@animate-ui/vue/utils/motion'
import { cn } from 'cn'
import { AnimatePresence, motion } from 'motion-v'
import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { themeTogglerButtonVariants } from './variants'

export type ThemeSelection = 'light' | 'dark' | 'system'
export type Resolved = 'light' | 'dark'

export type ThemeTogglerButtonContextType = {
  theme: ThemeSelection
  effective: ThemeSelection
  resolved: Resolved
  next: ThemeSelection
}

const ThemeTogglerButtonKey: InjectionKey<Ref<ThemeTogglerButtonContextType>>
  = Symbol('ThemeTogglerButtonContext')
const InstantKey: InjectionKey<Ref<boolean>> = Symbol('ThemeTogglerButtonInstant')

export function useThemeTogglerButton() {
  const context = inject(ThemeTogglerButtonKey)
  if (!context)
    throw new Error('useThemeTogglerButton must be used within a ThemeTogglerButton')
  return context
}

const SWAP_TRANSITION: Transition = motionTokens.transition.swap

const HIDDEN = {
  opacity: 0,
  scale: motionTokens.scale.icon,
  filter: motionTokens.blur.icon,
}
const SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' }

const IconSwap = defineComponent({
  name: 'IconSwap',
  inheritAttrs: false,
  props: {
    swapKey: { type: String, required: true },
    instant: Boolean,
    rotate: Number,
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const reduce = useShouldReduceMotion()
    // The new icon is painted once as it enters, then animates, even after a long frame.
    const painted = ref(true)
    let frame = 0
    watch(
      () => props.swapKey,
      () => {
        if (props.instant)
          return
        painted.value = false
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => (painted.value = true))
        })
      },
      { flush: 'sync' },
    )
    onBeforeUnmount(() => cancelAnimationFrame(frame))
    const defaultTransition = useTempoTransition(() =>
      props.rotate ? motionTokens.transition.spin : SWAP_TRANSITION,
    )
    return () => {
      const turn = reduce.value || !props.rotate ? undefined : props.rotate
      const entering = reduce.value
        ? { opacity: 0, filter: HIDDEN.filter }
        : turn ? { ...HIDDEN, rotate: -turn } : HIDDEN
      const leaving = reduce.value
        ? { opacity: 0, filter: HIDDEN.filter }
        : turn ? { ...HIDDEN, rotate: turn } : HIDDEN
      const shown = reduce.value
        ? { opacity: 1, filter: SHOWN.filter }
        : turn ? { ...SHOWN, rotate: 0 } : SHOWN
      return h(
        'span',
        {
          ...attrs,
          style: [
            { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
            attrs.style,
          ],
        },
        h(AnimatePresence as Component, { mode: 'popLayout', initial: false }, () =>
          h(
            motion.span as Component,
            {
              'key': props.swapKey,
              'data-icon': props.swapKey,
              'aria-hidden': 'true',
              'initial': props.instant ? false : entering,
              'animate': painted.value || props.instant ? shown : entering,
              'exit': props.instant ? undefined : leaving,
              'transition': props.transition ?? defaultTransition.value,
              'style': { display: 'inline-flex' },
            },
            slots,
          )),
      )
    }
  },
})

const DEFAULT_MODES: ThemeSelection[] = ['light', 'dark', 'system']

function getNextTheme(
  effective: ThemeSelection,
  resolved: Resolved,
  modes: ThemeSelection[],
): ThemeSelection {
  let i = modes.indexOf(effective)
  if (i === -1)
    i = modes.indexOf(resolved)
  if (i === -1)
    return modes[0] ?? resolved
  return modes[(i + 1) % modes.length]!
}

type Variants = VariantProps<typeof themeTogglerButtonVariants>

export const ThemeTogglerButton = defineComponent({
  name: 'ThemeTogglerButton',
  inheritAttrs: false,
  props: {
    theme: { type: String as PropType<ThemeSelection>, required: true },
    resolvedTheme: { type: String as PropType<Resolved>, required: true },
    setTheme: { type: Function as PropType<(theme: ThemeSelection) => void>, required: true },
    modes: { type: Array as PropType<ThemeSelection[]>, default: () => DEFAULT_MODES },
    variant: String as PropType<Variants['variant']>,
    size: String as PropType<Variants['size']>,
  },
  setup(props, { attrs, slots }) {
    const mounted = ref(false)
    const settled = ref(false)
    let frame = 0
    onMounted(() => {
      mounted.value = true
      frame = requestAnimationFrame(() => (settled.value = true))
    })
    onBeforeUnmount(() => cancelAnimationFrame(frame))

    const context = computed<ThemeTogglerButtonContextType>(() => ({
      theme: mounted.value
        ? props.modes.includes('system') ? props.theme : props.resolvedTheme
        : 'light',
      effective: mounted.value ? props.theme : 'light',
      resolved: mounted.value ? props.resolvedTheme : 'light',
      next: getNextTheme(props.theme, props.resolvedTheme, props.modes),
    }))
    provide(ThemeTogglerButtonKey, context)
    provide(InstantKey, computed(() => !settled.value))

    const onClick = (event: MouseEvent) => {
      const listener = attrs.onClick
      for (const each of Array.isArray(listener) ? listener : [listener])
        if (typeof each === 'function') each(event)
      if (event.defaultPrevented)
        return
      props.setTheme(context.value.next)
    }

    return () =>
      h(
        Button,
        {
          ...attrs,
          'data-slot': 'theme-toggler-button',
          'data-theme': context.value.theme,
          'class': cn(themeTogglerButtonVariants({ variant: props.variant, size: props.size }), attrs.class as string),
          onClick,
        },
        slots,
      )
  },
})

/** The theme's icon: the `light`, `dark` and `system` slots, swapped on a change. */
export const ThemeTogglerButtonIcon = defineComponent({
  name: 'ThemeTogglerButtonIcon',
  inheritAttrs: false,
  props: {
    rotate: { type: Number, default: motionTokens.rotate.icon },
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const context = useThemeTogglerButton()
    const instant = inject(InstantKey, ref(true))
    return () => {
      const { theme, resolved } = context.value
      const key = theme === 'system' && !slots.system ? resolved : theme
      return h(
        IconSwap,
        {
          ...attrs,
          'data-slot': 'theme-toggler-button-icon',
          'swapKey': key,
          'instant': instant.value,
          'rotate': props.rotate,
          'transition': props.transition,
        },
        () => (key === 'system' ? slots.system?.() : key === 'dark' ? slots.dark?.() : slots.light?.()),
      )
    }
  },
})
