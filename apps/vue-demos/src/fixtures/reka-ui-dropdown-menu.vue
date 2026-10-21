<script setup lang="ts">
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md'
const open = ref(false)
const size = ref('small')
const bold = ref(false)
const grid = ref(false)
const showStar = ref(false)
const showKept = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section class="flex items-center gap-4">
      <p data-testid="controlled-open">{{ open ? 'open' : 'closed' }}</p>
      <DropdownMenuRoot v-model:open="open" :modal="false">
        <DropdownMenuTrigger>Controlled</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent :class="content">
            <DropdownMenuItem>Controlled item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <button type="button" @click="open = false">Close from outside</button>
    </section>

    <section class="flex items-center gap-4">
      <p data-testid="size">{{ size }}</p>
      <p data-testid="bold">{{ String(bold) }}</p>
      <DropdownMenuRoot>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent :class="content">
            <DropdownMenuRadioGroup v-model="size">
              <DropdownMenuRadioItem v-for="value in ['small', 'large']" :key="value" :value="value">
                <DropdownMenuItemIndicator>•</DropdownMenuItemIndicator>
                {{ value === 'small' ? 'Small' : 'Large' }}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuCheckboxItem v-model="bold">
              <DropdownMenuItemIndicator>✓</DropdownMenuItemIndicator>
              Bold
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </section>

    <section class="flex items-center gap-4">
      <p data-testid="grid">{{ String(grid) }}</p>
      <DropdownMenuRoot>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent :class="content">
            <DropdownMenuCheckboxItem
              v-model="grid"
              @select="(event: Event) => event.preventDefault()"
            >
              <DropdownMenuItemIndicator>
                <HugeiconsIcon :icon="Tick02Icon" :stroke-width="2" />
              </DropdownMenuItemIndicator>
              Show grid
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </section>

    <section class="flex items-center gap-4">
      <button type="button" @click="showStar = true">Show star menu</button>
      <DropdownMenuRoot v-if="showStar" :default-open="true">
        <DropdownMenuTrigger>Star</DropdownMenuTrigger>
        <DropdownMenuContent :class="content" side="right">
          <DropdownMenuItem>Star item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </section>

    <section class="flex items-center gap-4">
      <button type="button" @click="showKept = true">Show force-mounted menu</button>
      <DropdownMenuRoot v-if="showKept" :modal="false">
        <DropdownMenuTrigger>Force mounted</DropdownMenuTrigger>
        <DropdownMenuPortal force-mount>
          <DropdownMenuContent :class="content">
            <DropdownMenuItem>Kept item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </section>
  </div>
</template>
