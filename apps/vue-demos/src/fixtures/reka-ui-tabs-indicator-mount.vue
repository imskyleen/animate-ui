<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const tabs = ['One', 'Two', 'Three']
const settled = ref(false)
const entering = ref(false)
</script>

<template>
  <div class="dark flex flex-col gap-6 bg-background p-6 text-foreground">
    <component :is="'style'">
      @keyframes tabs-mount-entrance{from{transform:perspective(500px) rotateX(-20deg) scale(0.8)}}
    </component>
    <section data-testid="vue-reka-ui-settle" class="flex flex-col gap-2">
      <button type="button" @click="settled = !settled">
        {{ settled ? 'Hide tabs' : 'Show tabs' }}
      </button>
      <Tabs v-if="settled" default-value="Three" class="w-[300px]">
        <TabsList>
          <TabsTrigger v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</TabsTrigger>
        </TabsList>
        <TabsContent v-for="tab in tabs" :key="tab" :value="tab">{{ tab }} panel</TabsContent>
      </Tabs>
    </section>
    <section data-testid="vue-reka-ui-entrance" class="flex flex-col gap-2">
      <button type="button" @click="entering = true">Show in entrance</button>
      <div v-if="entering" data-testid="entrance-box" style="animation: tabs-mount-entrance 300ms ease-out">
        <Tabs default-value="Three" class="w-[300px]">
          <TabsList>
            <TabsTrigger v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</TabsTrigger>
          </TabsList>
          <TabsContent v-for="tab in tabs" :key="tab" :value="tab">{{ tab }} panel</TabsContent>
        </Tabs>
      </div>
    </section>
  </div>
</template>
