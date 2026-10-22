<script setup lang="ts">
import type { PageTransitionEffect } from '../../../v2/registry/vue/components/page-transition'
import { startTransition } from 'motion-v'
import { ref } from 'vue'
import { PageTransition, PageTransitionShared } from '../../../v2/registry/vue/components/page-transition'

const EFFECTS: PageTransitionEffect[] = ['fade', 'slide', 'push', 'zoom', 'iris', 'wipe', 'bands', 'stack', 'flow', 'chop', 'random']

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

const effect = ref<PageTransitionEffect>('fade')
const page = ref(0)

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
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Effect">
      <button
        v-for="name in EFFECTS"
        :key="name"
        role="radio"
        :aria-checked="effect === name"
        class="rounded-md border px-3 py-1.5 text-sm aria-checked:bg-foreground aria-checked:text-background"
        @click="effect = name"
      >
        {{ name }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border">
      <nav class="flex gap-1 border-b p-2">
        <button
          v-for="(item, index) in PAGES"
          :key="item.title"
          :aria-current="index === page ? 'page' : undefined"
          class="rounded-md px-3 py-1.5 text-sm aria-[current=page]:bg-accent"
          @click="go(index)"
        >
          {{ item.title }}
        </button>
      </nav>
      <PageTransition
        :effect="effect"
        :page-key="page"
        :class="`relative flex h-80 flex-col justify-end gap-2 p-8 ${PAGES[page]!.tone}`"
      >
        <PageTransitionShared
          v-if="page < 2"
          name="cover"
          :class="page === 0
            ? 'absolute top-8 right-8 size-20 rounded-2xl bg-foreground'
            : 'absolute inset-x-8 top-8 h-24 rounded-lg bg-foreground'"
        />
        <h1 class="text-4xl font-medium">
          {{ PAGES[page]!.title }}
        </h1>
        <p class="text-muted-foreground">
          {{ PAGES[page]!.text }}
        </p>
      </PageTransition>
    </div>
  </div>
</template>
