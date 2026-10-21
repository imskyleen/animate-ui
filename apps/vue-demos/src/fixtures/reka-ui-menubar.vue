<script setup lang="ts">
import { ref } from 'vue'
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarRoot,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const content = 'min-w-40 rounded-md border bg-white p-1 shadow-md'
const value = ref('')
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section class="flex items-center gap-4">
      <p data-testid="value">{{ value || 'none' }}</p>
      <MenubarRoot v-model="value" class="flex gap-2">
        <MenubarMenu v-for="menu in ['alpha', 'beta']" :key="menu" :value="menu">
          <MenubarTrigger>{{ menu === 'alpha' ? 'Alpha' : 'Beta' }}</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent data-slot="menubar-content" :class="content">
              <MenubarItem>{{ menu === 'alpha' ? 'Alpha item' : 'Beta item' }}</MenubarItem>
              <MenubarSub v-if="menu === 'alpha'">
                <MenubarSubTrigger>Alpha more</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent data-slot="menubar-sub-content" :class="content">
                    <MenubarItem>Alpha sub item</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </MenubarRoot>
    </section>

    <section>
      <MenubarRoot class="flex gap-2">
        <MenubarMenu>
          <MenubarTrigger>Star menu</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent :class="content">
              <MenubarItem>Star item</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Other menu</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent :class="content">
              <MenubarItem>Other item</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </MenubarRoot>
    </section>

    <section>
      <MenubarRoot class="flex gap-2">
        <MenubarMenu v-for="menu in ['Gamma', 'Delta']" :key="menu" :value="menu">
          <MenubarTrigger>{{ menu }}</MenubarTrigger>
          <MenubarPortal force-mount>
            <MenubarContent data-slot="menubar-content" align="start" :class="content">
              <MenubarItem>{{ menu }} item</MenubarItem>
              <template v-if="menu === 'Delta'">
                <MenubarItem>Delta second item</MenubarItem>
                <MenubarItem>Delta third, longer item</MenubarItem>
              </template>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </MenubarRoot>
    </section>
  </div>
</template>
