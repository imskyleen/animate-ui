<script setup lang="ts">
import type { NavigationMenuTriggerProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import {
  NavigationMenuTrigger,
  useForwardProps,
} from "@animate-ui/vue/primitives/reka-ui"
import { navigationMenuTriggerStyle } from "."

const props = defineProps<NavigationMenuTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuTrigger
    data-slot="navigation-menu-trigger"
    v-bind="forwardedProps"
    :class="cn(navigationMenuTriggerStyle(), 'group', props.class)"
  >
    <slot />
    <HugeiconsIcon :icon="ArrowDown01Icon" :stroke-width="2"
      class="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true" />
  </NavigationMenuTrigger>
</template>
