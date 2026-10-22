<script setup lang="ts">
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@animate-ui/vue/primitives/tabs'
import Example from './animate-ui-tabs-example.vue'
</script>

<template>
  <div class="flex flex-col gap-10">
    <button type="button">
      Before
    </button>
    <Example label="Horizontal" />
    <Example label="Vertical" orientation="vertical" />
    <Example label="RTL" dir="rtl" />
    <Tabs>
      <TabsList aria-label="Custom ids" class="flex gap-1">
        <TabsTrigger id="my-trigger" value="alpha">
          Alpha
        </TabsTrigger>
        <TabsTrigger value="beta">
          Beta
        </TabsTrigger>
      </TabsList>
      <TabsContents>
        <TabsContent id="my-panel" value="alpha">
          Alpha panel
        </TabsContent>
        <TabsContent value="beta">
          Beta panel
        </TabsContent>
      </TabsContents>
    </Tabs>
  </div>
</template>
