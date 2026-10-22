<script setup lang="ts">
import type { Direction, ThemeSelection } from '@animate-ui/vue/primitives/effects/theme-toggler'
import { ComputerIcon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ThemeToggler } from '@animate-ui/vue/primitives/effects/theme-toggler'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'

withDefaults(defineProps<{ direction?: Direction }>(), { direction: 'ltr' })

const NEXT: Record<ThemeSelection, ThemeSelection> = {
  light: 'system',
  system: 'dark',
  dark: 'light',
}
const ICONS = { light: Sun03Icon, dark: Moon02Icon, system: ComputerIcon }

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
</script>

<template>
  <ThemeToggler
    :theme="theme"
    :resolved-theme="resolvedTheme"
    :set-theme="setTheme"
    :direction="direction"
  >
    <template #default="{ effective, toggleTheme }">
      <Button
        variant="outline"
        size="icon-lg"
        :aria-label="`Theme: ${effective}. Switch to ${NEXT[effective as ThemeSelection]}`"
        @click="toggleTheme(NEXT[effective as ThemeSelection])"
      >
        <HugeiconsIcon :icon="ICONS[effective as ThemeSelection]" :stroke-width="2" />
      </Button>
    </template>
  </ThemeToggler>
</template>
