<script setup lang="ts">
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@animate-ui/vue/primitives/reka-ui'

defineProps<{ names: string[], dir?: 'ltr' | 'rtl' }>()

const link = 'block rounded px-2 py-1 hover:bg-[rgb(255,0,0)]'
</script>

<template>
  <NavigationMenuRoot :dir="dir" class="relative">
    <NavigationMenuList class="flex gap-2">
      <NavigationMenuItem v-for="name in names" :key="name" :value="name">
        <NavigationMenuTrigger class="w-28 px-2 py-1">
          {{ name }}
        </NavigationMenuTrigger>
        <NavigationMenuContent
          data-slot="navigation-menu-content"
          class="absolute top-0 left-0 w-64 p-2"
        >
          <NavigationMenuLink :href="`#${name}`" :class="link">
            {{ name }} link
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
    <div :class="`absolute top-full mt-2 ${dir === 'rtl' ? 'right-0' : 'left-0'}`">
      <NavigationMenuViewport class="relative h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white" />
    </div>
  </NavigationMenuRoot>
</template>
