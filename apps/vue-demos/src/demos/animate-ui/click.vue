<script setup lang="ts">
import type { ClickVariant } from '@animate-ui/vue/primitives/effects/click'
import { Click } from '@animate-ui/vue/primitives/effects/click'
import { cn } from 'cn'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ global?: boolean | string, duration?: number | string, size?: number | string }>(),
  { global: false, duration: 400, size: 100 },
)

const VARIANTS: ClickVariant[] = ['ring', 'ripple', 'crosshair', 'burst', 'particles']
const scopeElement = ref<HTMLElement | null>(null)
const variant = ref<ClickVariant>('ring')
const scope = computed(() =>
  props.global === true || props.global === 'true' ? undefined : scopeElement.value,
)
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <div
      ref="scopeElement"
      class="flex h-56 items-center justify-center rounded-xl border border-dashed text-foreground"
    >
      <Click
        :variant="variant"
        :scope="scope"
        :color="variant === 'ripple' ? 'var(--color-primary)' : 'currentColor'"
        :size="Number(size)"
        :duration="Number(duration)"
      >
        <p class="text-lg font-medium text-muted-foreground select-none">
          Click anywhere in this area
        </p>
      </Click>
    </div>
    <div role="radiogroup" aria-label="Variant" class="flex flex-wrap justify-center gap-1">
      <button
        v-for="item in VARIANTS"
        :key="item"
        type="button"
        role="radio"
        :aria-checked="variant === item"
        :class="cn(
          'h-7 rounded-md px-2.5 text-xs font-medium capitalize transition-colors',
          variant === item ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground',
        )"
        @click="variant = item"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>
