<script setup lang="ts">
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@animate-ui/vue/primitives/tabs'

defineProps<{ id: string, defaultValue?: string, loaded?: boolean, late?: boolean }>()
</script>

<template>
  <Tabs :default-value="defaultValue">
    <TabsList>
      <TabsTrigger value="one">
        One
      </TabsTrigger>
      <TabsTrigger value="two">
        Two
      </TabsTrigger>
    </TabsList>
    <TabsContents :data-testid="id">
      <TabsContent value="one">
        <template v-if="late">
          <div v-if="loaded" style="height: 40px">
            Loaded
          </div>
        </template>
        <div v-else style="height: 40px">
          Panel one
        </div>
      </TabsContent>
      <TabsContent value="two">
        <div style="height: 120px">
          Panel two
        </div>
      </TabsContent>
    </TabsContents>
  </Tabs>
</template>
