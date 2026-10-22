<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import PanelLeft from "../../../../../v2/registry/vue/hugeicons/panel-left/PanelLeft.vue"
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar, open, openMobile, isMobile } = useSidebar()
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
    <PanelLeft :animate="!(isMobile ? openMobile : open)" :initial="false" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
