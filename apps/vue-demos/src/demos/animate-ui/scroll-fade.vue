<script setup lang="ts">
import { ScrollFade } from '@animate-ui/vue/primitives/effects/scroll-fade'

withDefaults(
  defineProps<{ size?: number | string, shrink?: number | string, blur?: number | string }>(),
  { size: 40, shrink: 0.03, blur: 4 },
)

const RELEASES = [
  { version: '2.4.0', date: 'Oct 2', title: 'Scroll fade', tag: 'New' },
  { version: '2.3.2', date: 'Sep 28', title: 'Tabs keyboard navigation' },
  { version: '2.3.1', date: 'Sep 21', title: 'Highlight follows scrolling' },
  { version: '2.3.0', date: 'Sep 14', title: 'Base UI drawer', tag: 'New' },
  { version: '2.2.4', date: 'Sep 7', title: 'Faster tooltip warm-up' },
  { version: '2.2.3', date: 'Aug 31', title: 'Reduced motion everywhere' },
  { version: '2.2.2', date: 'Aug 24', title: 'React Aria select' },
  { version: '2.2.1', date: 'Aug 17', title: 'Tempo provider' },
  { version: '2.2.0', date: 'Aug 10', title: 'Accordion', tag: 'New' },
  { version: '2.1.0', date: 'Aug 3', title: 'Motion 14' },
  { version: '2.0.3', date: 'Jul 27', title: 'Sliding number decimals' },
  { version: '2.0.2', date: 'Jul 20', title: 'Dialog origin from trigger' },
  { version: '2.0.1', date: 'Jul 13', title: 'Smaller bundle' },
  { version: '2.0.0', date: 'Jul 6', title: 'Drop-in primitives', tag: 'New' },
  { version: '1.9.4', date: 'Jun 29', title: 'Icon loop delay' },
  { version: '1.9.3', date: 'Jun 22', title: 'Ripple on keyboard press' },
]
</script>

<template>
  <div class="w-full max-w-xs overflow-hidden rounded-xl border bg-card">
    <div class="flex items-center justify-between border-b px-4 py-3">
      <h3 class="text-sm font-medium">
        Changelog
      </h3>
      <span class="text-xs text-muted-foreground">{{ RELEASES.length }} releases</span>
    </div>
    <ScrollFade :size="Number(size)" :shrink="Number(shrink)" :blur="Number(blur)" class="h-64">
      <ul class="flex flex-col p-2">
        <li
          v-for="release in RELEASES"
          :key="release.version"
          class="flex items-center gap-3 rounded-md px-2 py-1"
        >
          <span class="w-12 shrink-0 font-mono text-xs text-muted-foreground">{{ release.version }}</span>
          <span class="flex-1 truncate text-sm">{{ release.title }}</span>
          <span
            v-if="release.tag"
            class="rounded-full bg-primary px-1.5 text-[9px] leading-4 font-medium text-primary-foreground"
          >{{ release.tag }}</span>
          <span v-else class="text-xs text-muted-foreground">{{ release.date }}</span>
        </li>
      </ul>
    </ScrollFade>
  </div>
</template>
