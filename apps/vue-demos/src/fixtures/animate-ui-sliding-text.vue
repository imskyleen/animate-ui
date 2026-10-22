<script setup lang="ts">
import { SlidingText } from '@animate-ui/vue/primitives/texts/sliding'
</script>

<template>
  <div class="flex flex-col gap-8 text-2xl">
    <a
      data-testid="link"
      href="#"
      class="inline-block rounded-md bg-neutral-200 px-10 py-5"
    >
      <SlidingText text="Get started" />
    </a>
    <button
      type="button"
      data-testid="button-click"
      class="inline-block rounded-md bg-neutral-200 px-10 py-5"
    >
      <SlidingText trigger="click" text="Next" />
    </button>
    <SlidingText data-testid="alone" text="Alone" />
  </div>
</template>
