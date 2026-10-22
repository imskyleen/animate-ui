<script setup lang="ts">
import { ScrollFade } from '@animate-ui/vue/primitives/effects/scroll-fade'
import { onMounted, ref } from 'vue'

const list = ref<HTMLUListElement | null>(null)
const seen = ref('')
onMounted(() => (seen.value = list.value?.tagName ?? 'none'))
</script>

<template>
  <div class="flex flex-col gap-6">
    <ScrollFade data-testid="short" class="h-[200px] w-60 border">
      <div v-for="i in 3" :key="i" class="h-10 shrink-0 border-b px-2 leading-10">
        Item {{ i }}
      </div>
    </ScrollFade>
    <ScrollFade data-testid="long" class="h-[200px] w-60 border">
      <div v-for="i in 20" :key="i" class="h-10 shrink-0 border-b px-2 leading-10">
        Item {{ i }}
      </div>
    </ScrollFade>
    <ScrollFade data-testid="horizontal" orientation="horizontal" class="flex w-[200px] border">
      <div v-for="i in 12" :key="i" class="w-20 shrink-0 border-r px-2 py-4">
        {{ i }}
      </div>
    </ScrollFade>
    <ScrollFade as-child class="faded">
      <ul
        ref="list"
        data-testid="as-child"
        :data-ref="seen"
        class="h-[200px] w-60 border"
        style="padding-top: 4px"
      >
        <li v-for="i in 20" :key="i" class="h-10 leading-10">
          Row {{ i }}
        </li>
      </ul>
    </ScrollFade>
    <div style="transform: scale(0.5); transform-origin: top left">
      <ScrollFade data-testid="scaled" class="h-[200px] w-60 border">
        <div v-for="i in 20" :key="i" class="h-10 shrink-0 border-b px-2 leading-10">
          Item {{ i }}
        </div>
      </ScrollFade>
    </div>
    <ScrollFade data-testid="filtered" class="h-[200px] w-60 border">
      <div
        v-for="i in 20"
        :key="i"
        class="h-10 shrink-0 border-b px-2 leading-10"
        :style="{ filter: i === 5 ? 'grayscale(1)' : undefined }"
      >
        Item {{ i }}
      </div>
    </ScrollFade>
    <ScrollFade data-testid="grouped" class="h-[200px] w-60 border">
      <section
        v-for="title in ['Components', 'Buttons', 'Texts', 'Effects']"
        :key="title"
        :data-group="title"
        class="mb-4"
      >
        <p class="h-8 px-2 leading-8 font-medium">
          {{ title }}
        </p>
        <ul>
          <li v-for="i in 5" :key="i" class="h-8 px-2 leading-8">
            {{ title }} {{ i }}
          </li>
        </ul>
      </section>
    </ScrollFade>
  </div>
</template>
