<script setup lang="ts">
import type { NavigationMenuViewportProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import {
  NavigationMenuViewport,
  useForwardProps,
} from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<NavigationMenuViewportProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <div class="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuViewport
      data-slot="navigation-menu-viewport"
      v-bind="forwardedProps"
      :class="
        cn(
          'origin-top-center bg-popover text-popover-foreground relative mt-1.5 h-(--reka-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border shadow md:w-(--reka-navigation-menu-viewport-width) left-(--reka-navigation-menu-viewport-left)',
          props.class,
        )
      "
    />
  </div>
</template>
