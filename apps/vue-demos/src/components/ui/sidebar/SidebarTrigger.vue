<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons"
import * as SidebarPrimitive from "@animate-ui/vue/primitives/sidebar"
import { HugeiconsIcon } from "@hugeicons/vue"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <SidebarPrimitive.TriggerIcon>
      <template #open>
        <HugeiconsIcon :icon="PanelLeftCloseIcon" :stroke-width="2" />
      </template>
      <template #closed>
        <HugeiconsIcon :icon="PanelLeftOpenIcon" :stroke-width="2" />
      </template>
    </SidebarPrimitive.TriggerIcon>
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
