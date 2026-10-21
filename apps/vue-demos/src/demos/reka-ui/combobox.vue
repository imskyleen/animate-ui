<script setup lang="ts">
import type { CheckAnimation } from '@animate-ui/vue/provider'
import { Tick02Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'

withDefaults(defineProps<{ checkAnimation?: CheckAnimation }>(), {
  checkAnimation: 'draw',
})

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]

const selectedFramework = ref<(typeof frameworks)[number]>()
</script>

<template>
  <AnimateUIProvider :check-animation="checkAnimation">
    <Combobox v-model="selectedFramework" by="label">
      <ComboboxAnchor as-child>
        <ComboboxTrigger as-child>
          <Button variant="outline" class="w-[200px] justify-between">
            {{ selectedFramework?.label ?? 'Select framework...' }}
            <HugeiconsIcon :icon="UnfoldMoreIcon" :stroke-width="2" class="opacity-50" />
          </Button>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxList>
        <ComboboxInput placeholder="Search framework..." />
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxItem
            v-for="framework in frameworks"
            :key="framework.value"
            :value="framework"
          >
            {{ framework.label }}
            <ComboboxItemIndicator>
              <HugeiconsIcon :icon="Tick02Icon" :stroke-width="2" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxList>
    </Combobox>
  </AnimateUIProvider>
</template>
