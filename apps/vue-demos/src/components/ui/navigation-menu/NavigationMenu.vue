<script setup lang="ts">
import type { NavigationMenuRootEmits, NavigationMenuRootProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import {
  NavigationMenuRoot,
  useForwardPropsEmits,
} from "@animate-ui/vue/primitives/reka-ui"
import NavigationMenuViewport from "./NavigationMenuViewport.vue"

const props = withDefaults(defineProps<NavigationMenuRootProps & {
  class?: HTMLAttributes["class"]
  viewport?: boolean
}>(), {
  viewport: true,
})
const emits = defineEmits<NavigationMenuRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "viewport")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NavigationMenuRoot
    v-slot="slotProps"
    data-slot="navigation-menu"
    :data-viewport="viewport"
    v-bind="forwarded"
    :class="cn('group/navigation-menu relative flex max-w-max flex-1 items-center justify-center', props.class)"
  >
    <slot v-bind="slotProps" />
    <NavigationMenuViewport v-if="viewport" />
  </NavigationMenuRoot>
</template>
