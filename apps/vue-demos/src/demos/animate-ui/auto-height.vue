<script setup lang="ts">
import { AutoHeight } from '@animate-ui/vue/primitives/effects/auto-height'
import { AnimatePresence, motion } from 'motion-v'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const SHORT = 'Animate UI is a set of animated primitives for Vue, built with Motion.'
const LONG = [
  'Animate UI is a set of animated primitives for Vue, built with Motion.',
  'Swap the import of your reka-ui primitives and your components animate, with exactly the same API.',
  'Its own primitives, like this one, cover the effects reka-ui doesn\'t have.',
]
const swap = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(4px)' },
  transition: { duration: 0.4, ease: 'easeInOut' },
} as const

const expanded = ref(false)
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-start gap-4">
    <AutoHeight :deps="[expanded]" class="w-full rounded-xl border bg-card p-4 text-sm">
      <AnimatePresence mode="wait" :initial="false">
        <motion.div v-if="expanded" key="long" class="flex flex-col gap-2" v-bind="swap">
          <p v-for="paragraph in LONG" :key="paragraph">
            {{ paragraph }}
          </p>
        </motion.div>
        <motion.p v-else key="short" v-bind="swap">
          {{ SHORT }}
        </motion.p>
      </AnimatePresence>
    </AutoHeight>
    <Button
      variant="outline"
      size="sm"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show less' : 'Show more' }}
    </Button>
  </div>
</template>
