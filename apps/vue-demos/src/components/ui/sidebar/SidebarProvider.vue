<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import * as SidebarPrimitive from "@animate-ui/vue/primitives/sidebar"
import { cn } from "cn"
import { TooltipProvider } from "@animate-ui/vue/primitives/reka-ui"
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "./utils"

const props = withDefaults(defineProps<{
  defaultOpen?: boolean
  open?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  defaultOpen: !document?.cookie.includes("sidebar_state=false"),
  open: undefined,
})

const emits = defineEmits<{
  "update:open": [open: boolean]
}>()
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <SidebarPrimitive.Provider
      data-slot="sidebar-wrapper"
      :default-open="props.defaultOpen"
      :open="props.open"
      :style="{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      }"
      :class="cn('group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full', props.class)"
      v-bind="$attrs"
      @update:open="emits('update:open', $event)"
    >
      <slot />
    </SidebarPrimitive.Provider>
  </TooltipProvider>
</template>
