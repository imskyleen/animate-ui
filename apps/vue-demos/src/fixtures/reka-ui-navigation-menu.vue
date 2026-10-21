<script setup lang="ts">
import { ref } from 'vue'
import {
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@animate-ui/vue/primitives/reka-ui'

const panel = 'w-48 rounded-md border bg-white p-2 shadow-md'
const viewport = 'relative h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white'
const value = ref('')
</script>

<template>
  <div class="flex flex-col items-start gap-24">
    <section class="flex items-center gap-4">
      <p data-testid="value">
        {{ value || 'none' }}
      </p>
      <button type="button" @click="value = ''">
        Close it
      </button>
      <NavigationMenuRoot v-model="value" class="relative">
        <NavigationMenuList class="flex gap-2">
          <NavigationMenuItem value="one">
            <NavigationMenuTrigger>Controlled one</NavigationMenuTrigger>
            <NavigationMenuContent class="absolute top-0 left-0 p-2">
              <NavigationMenuLink href="#one">
                Link one
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div class="absolute top-full left-0">
          <NavigationMenuViewport :class="viewport" />
        </div>
      </NavigationMenuRoot>
    </section>

    <section data-testid="inline">
      <NavigationMenuRoot>
        <NavigationMenuList class="flex gap-2">
          <NavigationMenuItem class="relative">
            <NavigationMenuTrigger>Inline</NavigationMenuTrigger>
            <NavigationMenuContent :class="`absolute top-full left-0 ${panel}`">
              <NavigationMenuLink href="#inline">
                Inline link
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuRoot>
    </section>

    <section>
      <NavigationMenuRoot class="relative">
        <NavigationMenuList class="flex gap-8">
          <NavigationMenuItem v-for="item in ['one', 'two']" :key="item">
            <NavigationMenuTrigger class="w-28">
              {{ item === 'one' ? 'Star one' : 'Star two' }}
            </NavigationMenuTrigger>
            <NavigationMenuContent class="absolute top-0 left-0 p-2">
              <NavigationMenuLink :href="`#${item}`">
                Star link {{ item }}
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator
            data-testid="indicator"
            class="absolute top-full left-0 h-1 bg-black"
            :style="{
              width: 'var(--reka-navigation-menu-indicator-size)',
              transform: 'translateX(var(--reka-navigation-menu-indicator-position))',
            }"
          />
        </NavigationMenuList>
        <div class="absolute top-full left-0 mt-2">
          <NavigationMenuViewport :class="viewport" />
        </div>
      </NavigationMenuRoot>
    </section>
    <section>
      <NavigationMenuRoot class="relative">
        <NavigationMenuList class="flex gap-2">
          <NavigationMenuItem value="anchor">
            <NavigationMenuTrigger as-child>
              <a href="#anchored">Anchor trigger</a>
            </NavigationMenuTrigger>
            <NavigationMenuContent class="absolute top-0 left-0 p-2">
              <NavigationMenuLink href="#anchor-link">
                Anchor link
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div class="absolute top-full left-0">
          <NavigationMenuViewport :class="viewport" />
        </div>
      </NavigationMenuRoot>
    </section>
  </div>
</template>
