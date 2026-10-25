<script setup lang="ts">
import {
  BottomNavigation,
  BottomNavigationAccessory,
  BottomNavigationHighlight,
  BottomNavigationHighlightItem,
  BottomNavigationItem,
  BottomNavigationLabel,
} from '@animate-ui/vue/primitives/bottom-navigation'
import { Button } from '@animate-ui/vue/primitives/buttons/button'
import { computed, ref } from 'vue'

import House from '../../../../v2/registry/vue/icons/house/House.vue'
import Plus from '../../../../v2/registry/vue/icons/plus/Plus.vue'
import Search from '../../../../v2/registry/vue/icons/search/Search.vue'
import User from '../../../../v2/registry/vue/icons/user/User.vue'
import Wallet from '../../../../v2/registry/vue/icons/wallet/Wallet.vue'

const props = withDefaults(
  defineProps<{
    scrollBehavior?: 'none' | 'hide' | 'minimize'
    labels?: boolean | string
    accessory?: boolean | string
  }>(),
  { scrollBehavior: 'minimize', labels: true, accessory: true },
)

const showLabels = computed(() => String(props.labels) === 'true')
const showAccessory = computed(() => String(props.accessory) === 'true')

const ITEMS = [
  { value: 'home', label: 'Home', icon: House },
  { value: 'search', label: 'Search', icon: Search },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'profile', label: 'Profile', icon: User },
]

const PAYMENTS = [
  { name: 'Spotify', time: '08:12', amount: '€10.99' },
  { name: 'Figma', time: '09:30', amount: '€15.00' },
  { name: 'Uber', time: '12:42', amount: '€6.05' },
  { name: 'Notion', time: '14:05', amount: '€8.00' },
  { name: 'Airbnb', time: '17:03', amount: '€256.73' },
  { name: 'Vercel', time: '18:21', amount: '€20.00' },
  { name: 'Apple', time: '19:18', amount: '€2.99' },
  { name: 'Dribbble', time: '20:47', amount: '€52.92' },
  { name: 'Netflix', time: '21:15', amount: '€13.49' },
  { name: 'Linear', time: '22:02', amount: '€8.00' },
]

const value = ref('home')
const presses = ref(0)
const scrollRef = ref<HTMLElement | null>(null)
</script>

<template>
  <div class="relative h-[440px] w-[340px] overflow-hidden rounded-[2rem] border bg-background shadow-sm">
    <div ref="scrollRef" class="h-full overflow-y-auto px-5 pt-6 pb-24">
      <p class="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Today
      </p>
      <ul class="flex flex-col gap-4">
        <li v-for="payment in PAYMENTS" :key="payment.name" class="flex items-center gap-3">
          <span class="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {{ payment.name[0] }}
          </span>
          <span class="flex flex-1 flex-col">
            <span class="text-sm font-medium">{{ payment.name }}</span>
            <span class="text-xs text-muted-foreground">{{ payment.time }}</span>
          </span>
          <span class="text-sm font-medium tabular-nums">{{ payment.amount }}</span>
        </li>
      </ul>
    </div>
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
    <div class="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <BottomNavigation
        v-model="value"
        :scroll-behavior="scrollBehavior"
        :scroll-container="scrollRef"
        aria-label="Main"
        class="pointer-events-auto flex items-center gap-2"
      >
        <BottomNavigationHighlight class="absolute inset-0 z-0 rounded-full bg-muted">
          <ul class="flex items-center rounded-full border bg-background/80 p-1.5 shadow-lg backdrop-blur">
            <li v-for="item in ITEMS" :key="item.value">
              <BottomNavigationHighlightItem :value="item.value">
                <BottomNavigationItem :value="item.value" as-child>
                  <button
                    type="button"
                    :aria-label="item.label"
                    class="relative z-10 flex h-11 items-center justify-center rounded-full px-3.5 text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 hover:text-foreground data-[state=active]:text-foreground"
                  >
                    <component :is="item.icon" :animate="value === item.value" :initial="false" :size="20" />
                    <BottomNavigationLabel v-if="showLabels" class="pl-2 text-sm font-medium">
                      {{ item.label }}
                    </BottomNavigationLabel>
                  </button>
                </BottomNavigationItem>
              </BottomNavigationHighlightItem>
            </li>
          </ul>
        </BottomNavigationHighlight>
        <BottomNavigationAccessory
          v-if="showAccessory"
          class="rounded-full border bg-background/80 p-1.5 shadow-lg backdrop-blur"
        >
          <Button
            type="button"
            aria-label="New payment"
            class="flex size-11 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-300 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            @click="presses++"
          >
            <Plus :key="presses" :animate="presses > 0" :size="20" />
          </Button>
        </BottomNavigationAccessory>
      </BottomNavigation>
    </div>
  </div>
</template>
