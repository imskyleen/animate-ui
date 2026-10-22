<script setup lang="ts">
import type { Icon as IconSvgElement } from './data'
import { PlusSignIcon, UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

const props = defineProps<{
  teams: { name: string, logo: IconSvgElement, plan: string }[]
}>()

const { isMobile } = useSidebar()
const activeTeam = ref(props.teams[0])
</script>

<template>
  <SidebarMenu v-if="activeTeam">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <HugeiconsIcon :icon="activeTeam.logo" :stroke-width="2" class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ activeTeam.name }}</span>
              <span class="truncate text-xs">{{ activeTeam.plan }}</span>
            </div>
            <HugeiconsIcon :icon="UnfoldMoreIcon" :stroke-width="2" class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel class="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            <DropdownMenuItem
              v-for="(team, index) in teams"
              :key="team.name"
              class="gap-2 p-2"
              @click="activeTeam = team"
            >
              <div class="flex size-6 items-center justify-center rounded-md border">
                <HugeiconsIcon :icon="team.logo" :stroke-width="2" class="size-3.5 shrink-0" />
              </div>
              {{ team.name }}
              <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem class="gap-2 p-2">
              <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <HugeiconsIcon :icon="PlusSignIcon" :stroke-width="2" class="size-4" />
              </div>
              <div class="font-medium text-muted-foreground">
                Add team
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
