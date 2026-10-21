<script setup lang="ts">
import { ref } from 'vue'
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const open = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section data-testid="controlled" class="flex items-center gap-4">
      <p data-testid="controlled-open">{{ open ? 'open' : 'closed' }}</p>
      <button type="button" @click="open = !open">Toggle from outside</button>
      <HoverCardRoot v-model:open="open" :open-delay="0" :close-delay="0">
        <HoverCardTrigger href="#controlled">Controlled link</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent data-testid="controlled-content" side="right">
            Controlled card
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </section>

    <section data-testid="force-mount">
      <HoverCardRoot :open-delay="0" :close-delay="0">
        <HoverCardTrigger href="#force">Force mounted link</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent force-mount data-testid="force-mount-content" side="right">
            Kept mounted
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </section>

    <section data-testid="star">
      <HoverCardRoot :open-delay="0" :close-delay="0">
        <HoverCardTrigger href="#star">Star link</HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent data-testid="star-content" side="right">
            Star card
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </section>
  </div>
</template>
