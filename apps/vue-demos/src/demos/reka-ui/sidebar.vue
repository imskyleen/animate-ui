<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { data } from './sidebar/data'
import NavMain from './sidebar/NavMain.vue'
import NavProjects from './sidebar/NavProjects.vue'
import NavUser from './sidebar/NavUser.vue'
import TeamSwitcher from './sidebar/TeamSwitcher.vue'
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher :teams="data.teams" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain :items="data.navMain" />
        <NavProjects :projects="data.projects" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser :user="data.user" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] duration-(--animate-ui-sidebar-duration) ease-(--animate-ui-sidebar-easing) group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
        </div>
      </header>
    </SidebarInset>
  </SidebarProvider>
</template>
