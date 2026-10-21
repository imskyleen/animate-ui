<script setup lang="ts">
import { NavigationMenuLink } from '@/components/ui/navigation-menu'

defineProps<{ title: string, href: string }>()
</script>

<template>
  <li>
    <NavigationMenuLink as-child>
      <a :href="href">
        <div class="flex flex-col gap-1 text-sm">
          <div class="leading-none font-medium">{{ title }}</div>
          <div class="text-muted-foreground line-clamp-2">
            <slot />
          </div>
        </div>
      </a>
    </NavigationMenuLink>
  </li>
</template>
