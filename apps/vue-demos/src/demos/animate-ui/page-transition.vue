<script setup lang="ts">
import type { PageTransitionEffect } from '../../../../v2/registry/vue/components/page-transition'
import { startTransition } from 'motion-v'
import { ref, watch } from 'vue'
import { PageTransition, PageTransitionShared } from '../../../../v2/registry/vue/components/page-transition'

const props = withDefaults(
  defineProps<{ effect?: PageTransitionEffect, shared?: boolean | string, picker?: boolean | string }>(),
  { effect: 'slide', shared: true, picker: true },
)

const PAGES = [
  {
    title: 'Home',
    text: 'Animated primitives for Radix UI, Base UI and React Aria.',
    tone: 'bg-sky-100 dark:bg-sky-950',
  },
  {
    title: 'Docs',
    text: 'Swap the import and your shadcn/ui components animate.',
    tone: 'bg-amber-100 dark:bg-amber-950',
  },
  {
    title: 'Blog',
    text: 'Animate UI 2.0 is out, with a CLI and a skill.',
    tone: 'bg-emerald-100 dark:bg-emerald-950',
  },
]

const EFFECTS: PageTransitionEffect[] = ['fade', 'slide', 'push', 'zoom', 'iris', 'wipe', 'bands', 'stack', 'flow', 'chop', 'random']

const page = ref(0)
const chosen = ref<PageTransitionEffect>(props.effect)
watch(() => props.effect, (effect) => {
  chosen.value = effect
})

const on = (value: boolean | string) => value === true || value === 'true'

function go(next: number) {
  if (next === page.value)
    return
  const types = [next > page.value ? 'nav-forward' : 'nav-back']
  startTransition(() => {
    page.value = next
  }, { types })
}
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <div
      v-if="on(picker)"
      role="radiogroup"
      aria-label="Effect"
      class="flex flex-wrap justify-center gap-1"
    >
      <button
        v-for="name in EFFECTS"
        :key="name"
        role="radio"
        :aria-checked="chosen === name"
        class="rounded-md border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-checked:border-foreground aria-checked:bg-foreground aria-checked:text-background"
        @click="chosen = name"
      >
        {{ name }}
      </button>
    </div>
    <div class="w-full overflow-hidden rounded-xl border bg-background">
      <nav class="flex gap-1 border-b p-2">
        <button
          v-for="(item, index) in PAGES"
          :key="item.title"
          :aria-current="index === page ? 'page' : undefined"
          class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
          @click="go(index)"
        >
          {{ item.title }}
        </button>
      </nav>
      <PageTransition
        :effect="chosen"
        :page-key="page"
        :class="`relative flex h-64 flex-col justify-end gap-1.5 p-6 ${PAGES[page]!.tone}`"
      >
        <PageTransitionShared
          v-if="on(shared) && page < 2"
          name="page-transition-demo-cover"
          :class="page === 0
            ? 'absolute top-6 right-6 size-16 rounded-xl bg-primary'
            : 'absolute inset-x-6 top-6 h-20 rounded-lg bg-primary'"
        />
        <h2 class="text-2xl font-medium">
          {{ PAGES[page]!.title }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ PAGES[page]!.text }}
        </p>
      </PageTransition>
    </div>
  </div>
</template>
