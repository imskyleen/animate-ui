<script setup lang="ts">
import { ref } from 'vue'
import {
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const open = ref(false)
const changes = ref(0)
const onOpenChange = (next: boolean) => {
  open.value = next
  changes.value++
}
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section data-testid="controlled" class="flex items-center gap-4">
      <p data-testid="controlled-open">{{ open ? 'open' : 'closed' }}</p>
      <p data-testid="changes">{{ changes }}</p>
      <button type="button" @click="open = true">Open from outside</button>
      <PopoverRoot :open="open" @update:open="onOpenChange">
        <PopoverTrigger>Controlled trigger</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent data-testid="controlled-content" :side-offset="4">
            Controlled content
            <PopoverClose>Close controlled</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </section>

    <section data-testid="default-open">
      <PopoverRoot :default-open="true">
        <PopoverTrigger>Default open trigger</PopoverTrigger>
        <PopoverContent data-testid="default-open-content" side="right">
          Open on load
        </PopoverContent>
      </PopoverRoot>
    </section>

    <section data-testid="force-mount">
      <PopoverRoot>
        <PopoverTrigger>Force mounted trigger</PopoverTrigger>
        <PopoverPortal force-mount>
          <PopoverContent data-testid="force-mount-content" side="right">
            <button type="button">Hidden button</button>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </section>

    <section data-testid="star">
      <PopoverRoot>
        <PopoverTrigger>Star trigger</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            data-testid="star-content"
            class="custom-class"
            :style="{ transformOrigin: 'left top' }"
            :transition="{ duration: 0.2 }"
          >
            Star content
            <PopoverArrow />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </section>
  </div>
</template>
