<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import type { ThemeSelection, themeTogglerButtonVariants } from '../../../../v2/registry/vue/buttons/theme-toggler'
import { ComputerIcon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ThemeTogglerButton, ThemeTogglerButtonIcon } from '../../../../v2/registry/vue/buttons/theme-toggler'

type Variants = VariantProps<typeof themeTogglerButtonVariants>

const props = withDefaults(
  defineProps<{ variant?: Variants['variant'], size?: Variants['size'], system?: boolean | string }>(),
  { variant: 'default', size: 'default', system: false },
)

// The site's theme (next-themes): read from its storage and the page's class.
const theme = ref<ThemeSelection>('system')
const resolvedTheme = ref<'light' | 'dark'>('light')
const read = () => {
  theme.value = (localStorage.getItem('theme') as ThemeSelection | null) ?? 'system'
  resolvedTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
const observer = new MutationObserver(read)
onMounted(() => {
  read()
  observer.observe(document.documentElement, { attributeFilter: ['class'] })
})
onBeforeUnmount(() => observer.disconnect())

function setTheme(next: ThemeSelection) {
  localStorage.setItem('theme', next)
  window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: next }))
  read()
}

const withSystem = computed(() => props.system === true || props.system === 'true')
</script>

<template>
  <ThemeTogglerButton
    :theme="theme"
    :resolved-theme="resolvedTheme"
    :set-theme="setTheme"
    :modes="withSystem ? ['light', 'dark', 'system'] : ['light', 'dark']"
    aria-label="Toggle theme"
    :variant="variant"
    :size="size"
  >
    <ThemeTogglerButtonIcon>
      <template #light>
        <HugeiconsIcon :icon="Sun03Icon" :stroke-width="2" />
      </template>
      <template #dark>
        <HugeiconsIcon :icon="Moon02Icon" :stroke-width="2" />
      </template>
      <template #system>
        <HugeiconsIcon :icon="ComputerIcon" :stroke-width="2" />
      </template>
    </ThemeTogglerButtonIcon>
  </ThemeTogglerButton>
</template>
