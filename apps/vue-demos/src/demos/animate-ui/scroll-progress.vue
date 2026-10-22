<script setup lang="ts">
import { ArrowDown02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  ScrollProgress,
  ScrollProgressContainer,
  ScrollProgressProvider,
} from '@animate-ui/vue/primitives/scroll-progress'
import { cn } from 'cn'
import { motion } from 'motion-v'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    global?: boolean | string
    direction?: 'horizontal' | 'vertical'
  }>(),
  { global: false, direction: 'vertical' },
)

const isGlobal = computed(() => props.global === true || props.global === 'true')
const horizontal = computed(() => props.direction === 'horizontal')
</script>

<template>
  <div class="relative h-72 w-full max-w-md overflow-hidden rounded-xl border">
    <ScrollProgressProvider
      :key="`${isGlobal}-${direction}`"
      :global="isGlobal"
      :direction="direction"
    >
      <div
        :class="cn('z-50', isGlobal ? 'fixed inset-x-0 top-0' : 'absolute inset-x-3 bottom-3')"
      >
        <ScrollProgress :class="cn('h-1.5 bg-foreground', !isGlobal && 'rounded-full')" />
      </div>
      <div v-if="isGlobal" class="flex size-full items-center justify-center">
        <p class="text-sm font-medium">
          Scroll the page to see the progress bar
        </p>
      </div>
      <ScrollProgressContainer
        v-else
        :class="cn('size-full', horizontal ? 'overflow-x-auto' : 'overflow-y-auto')"
      >
        <div :class="cn('flex', !horizontal && 'flex-col')">
          <div class="flex h-72 w-full shrink-0 items-center justify-center">
            <p class="flex items-center gap-2 text-sm font-medium">
              Scroll to see the progress bar
              <motion.span
                :class="horizontal ? '-rotate-90' : undefined"
                :animate="{ y: [3, -3, 3] }"
                :transition="{ duration: 1.25, repeat: Infinity, ease: 'easeInOut', type: 'keyframes' }"
              >
                <HugeiconsIcon :icon="ArrowDown02Icon" :stroke-width="2" class="size-5" />
              </motion.span>
            </p>
          </div>
          <div class="h-72 w-full shrink-0 p-3">
            <div class="size-full rounded-xl bg-accent" />
          </div>
          <div class="h-72 w-full shrink-0" />
          <div class="h-72 w-full shrink-0 p-3">
            <div class="size-full rounded-xl bg-accent" />
          </div>
          <div class="h-72 w-full shrink-0" />
        </div>
      </ScrollProgressContainer>
    </ScrollProgressProvider>
  </div>
</template>
