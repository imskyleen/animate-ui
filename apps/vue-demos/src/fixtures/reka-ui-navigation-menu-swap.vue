<script setup lang="ts">
import NavMenu from './reka-ui-navigation-menu-swap-menu.vue'
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@animate-ui/vue/primitives/reka-ui'

const link = 'block rounded px-2 py-1 hover:bg-[rgb(255,0,0)]'
const sizes = [
  { name: 'Small', className: 'h-24 w-48' },
  { name: 'Medium', className: 'h-40 w-80' },
  { name: 'Large', className: 'h-56 w-[28rem]' },
]
</script>

<template>
  <div class="flex flex-col items-start gap-40">
    <section data-testid="ltr">
      <NavMenu :names="['Left one', 'Left two']" />
    </section>

    <section data-testid="rtl" dir="rtl" class="self-stretch">
      <NavMenu :names="['Right one', 'Right two']" dir="rtl" />
    </section>

    <section data-testid="inline">
      <NavigationMenuRoot>
        <NavigationMenuList class="flex gap-2">
          <NavigationMenuItem class="relative">
            <NavigationMenuTrigger class="px-2 py-1">
              Panel
            </NavigationMenuTrigger>
            <NavigationMenuContent
              data-slot="navigation-menu-content"
              class="absolute top-full left-0 w-48 rounded-md border bg-white p-2"
            >
              <NavigationMenuLink href="#panel" :class="link">
                Panel link
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuRoot>
    </section>
    <section data-testid="sizes" class="pb-96">
      <NavigationMenuRoot class="relative">
        <NavigationMenuList class="flex gap-2">
          <NavigationMenuItem v-for="size in sizes" :key="size.name" :value="size.name">
            <NavigationMenuTrigger class="w-28 px-2 py-1">
              {{ size.name }}
            </NavigationMenuTrigger>
            <NavigationMenuContent
              data-slot="navigation-menu-content"
              :class="`absolute top-0 left-0 p-2 ${size.className}`"
            >
              <NavigationMenuLink :href="`#${size.name}`" :class="link">
                {{ size.name }} link
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div class="absolute top-full left-0 mt-2">
          <NavigationMenuViewport
            data-testid="sizes-viewport"
            class="relative h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) overflow-hidden rounded-md border bg-white"
          />
        </div>
      </NavigationMenuRoot>
    </section>
  </div>
</template>
