<script setup lang="ts">
import { ref } from 'vue'
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const BOX = {
  border: '1px solid rgb(212, 212, 212)',
  borderRadius: '8px',
  background: 'white',
  padding: '12px',
}
const OTHER_BOX = { ...BOX, border: '2px solid rgb(239, 68, 68)' }
const value = ref('a')
</script>

<template>
  <div class="flex flex-col gap-10">
    <section data-testid="controlled">
      <p data-testid="controlled-value">{{ value }}</p>
      <button type="button" @click="value = 'a'">Select a</button>
      <TabsRoot v-model="value">
        <TabsList aria-label="Controlled">
          <TabsTrigger value="a">Controlled a</TabsTrigger>
          <TabsTrigger value="b">Controlled b</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Controlled panel a</TabsContent>
        <TabsContent value="b">Controlled panel b</TabsContent>
      </TabsRoot>
    </section>

    <section data-testid="star">
      <TabsRoot default-value="y">
        <TabsList aria-label="Star">
          <TabsTrigger value="x">Star x</TabsTrigger>
          <TabsTrigger value="y">Star y</TabsTrigger>
        </TabsList>
        <TabsContent value="x">Star panel x</TabsContent>
        <TabsContent value="y">Star panel y</TabsContent>
      </TabsRoot>
    </section>

    <section data-testid="force-mount">
      <TabsRoot default-value="1">
        <TabsList aria-label="Forced">
          <TabsTrigger value="1">Forced 1</TabsTrigger>
          <TabsTrigger value="2">Forced 2</TabsTrigger>
        </TabsList>
        <TabsContent value="1" force-mount data-testid="forced-1">Forced panel 1</TabsContent>
        <TabsContent value="2" force-mount data-testid="forced-2">Forced panel 2</TabsContent>
      </TabsRoot>
    </section>

    <section data-testid="manual">
      <TabsRoot default-value="1" activation-mode="manual">
        <TabsList aria-label="Manual">
          <TabsTrigger value="1">Manual 1</TabsTrigger>
          <TabsTrigger value="2">Manual 2</TabsTrigger>
        </TabsList>
        <TabsContent value="1">Manual panel 1</TabsContent>
        <TabsContent value="2">Manual panel 2</TabsContent>
      </TabsRoot>
    </section>

    <section data-testid="heights">
      <TabsRoot default-value="short">
        <TabsList aria-label="Heights">
          <TabsTrigger value="short">Short</TabsTrigger>
          <TabsTrigger value="tall">Tall</TabsTrigger>
        </TabsList>
        <TabsContent value="short">Short panel</TabsContent>
        <TabsContent value="tall">
          <p>Tall panel</p>
          <p>Its second line</p>
          <p>Its third line</p>
          <p>Its fourth line</p>
        </TabsContent>
      </TabsRoot>
    </section>

    <section data-testid="frames">
      <TabsRoot default-value="boxed">
        <TabsList aria-label="Frames">
          <TabsTrigger value="boxed">Boxed</TabsTrigger>
          <TabsTrigger value="boxed-tall">Boxed tall</TabsTrigger>
          <TabsTrigger value="other">Other box</TabsTrigger>
          <TabsTrigger value="text">Text box</TabsTrigger>
        </TabsList>
        <TabsContent value="boxed">
          <div data-box :style="BOX"><p>Boxed panel</p></div>
        </TabsContent>
        <TabsContent value="boxed-tall">
          <div data-box :style="BOX">
            <p>Boxed tall panel</p>
            <p>Its second line</p>
            <p>Its third line</p>
            <p>Its fourth line</p>
          </div>
        </TabsContent>
        <TabsContent value="other">
          <div data-box :style="OTHER_BOX"><p>Other box panel</p></div>
        </TabsContent>
        <TabsContent value="text">
          <div data-box :style="BOX">Text box panel</div>
        </TabsContent>
      </TabsRoot>
    </section>
  </div>
</template>
