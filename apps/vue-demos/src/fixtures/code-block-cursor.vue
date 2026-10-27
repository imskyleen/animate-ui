<script setup lang="ts">
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from '../demos/animate-ui/code-block'
</script>

<!-- A block caught writing just after a line break: its last line is empty. -->
<template>
  <CodeBlock class="w-80">
    <CodeBlockContent writing line-numbers>
      <CodeBlockLine>const a = 1;</CodeBlockLine>
      <CodeBlockLine />
    </CodeBlockContent>
  </CodeBlock>
</template>
