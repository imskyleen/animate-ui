<script setup lang="ts">
import CodeBlock from '../../../../v2/registry/vue/components/code-block/CodeBlock.vue'
import { useDark } from '@/lib/use-dark'

withDefaults(
  defineProps<{
    delay?: number | string
    duration?: number | string
    writing?: boolean | string
    cursor?: boolean | string
  }>(),
  { delay: 0, duration: 10000, writing: true, cursor: true },
)

const CODE = `'use client';

import * as React from 'react';

type MyComponentProps = {
  myProps: string;
} & React.ComponentProps<'div'>;

function MyComponent(props: MyComponentProps) {
  return (
    <div {...props}>
      <p>My Component</p>
    </div>
  );
}

export { MyComponent, type MyComponentProps };`

const on = (value: boolean | string) => value === true || value === 'true'
const dark = useDark()
</script>

<template>
  <CodeBlock
    :key="`${delay}-${duration}-${writing}`"
    :code="CODE"
    lang="tsx"
    :theme="dark ? 'dark' : 'light'"
    :writing="on(writing)"
    :delay="Number(delay)"
    :duration="Number(duration)"
    :cursor="on(cursor)"
    class="w-[420px] max-w-full"
    scroll-class="h-[372px] max-h-none"
  />
</template>
