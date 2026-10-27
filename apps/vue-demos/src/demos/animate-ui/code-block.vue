<script setup lang="ts">
import { Download01Icon, FileCodeIcon, TextWrapIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useCodeWriting } from '@animate-ui/vue/primitives/code-block'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  CodeBlockToken,
  useHighlightedCode,
} from './code-block'

const props = withDefaults(
  defineProps<{
    delay?: number | string
    duration?: number | string
    writing?: boolean | string
    cursor?: boolean | string
    cadence?: 'natural' | 'even'
  }>(),
  { delay: 0, duration: 6000, writing: true, cursor: true, cadence: 'even' },
)

const code = `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: "You are a helpful assistant. Answer in one short paragraph.",
    messages,
  })

  return result.toUIMessageStreamResponse()
}`

// The block keeps its full height while the code is written.
const LINES = code.split('\n').length

function download(value: string, filename: string) {
  const url = URL.createObjectURL(new Blob([value], { type: 'text/plain' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const wrap = ref(false)
const written = useCodeWriting(code, () => ({
  writing: String(props.writing) === 'true',
  delay: Number(props.delay),
  duration: Number(props.duration),
  cadence: props.cadence,
  inView: true,
}))
const lines = useHighlightedCode(written.code, 'ts')
</script>

<template>
  <div class="w-full max-w-lg">
    <CodeBlock :ref="written.ref">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <HugeiconsIcon :icon="FileCodeIcon" :stroke-width="2" />
          app/api/chat/route.ts
        </CodeBlockTitle>
        <CodeBlockActions>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Wrap lines"
            :aria-pressed="wrap"
            class="aria-pressed:text-foreground"
            @click="wrap = !wrap"
          >
            <HugeiconsIcon :icon="TextWrapIcon" :stroke-width="2" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Download"
            @click="download(code, 'route.ts')"
          >
            <HugeiconsIcon :icon="Download01Icon" :stroke-width="2" />
          </Button>
          <CodeBlockCopyButton :value="code" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent
        :wrap="wrap"
        line-numbers
        :writing="written.writing.value"
        :cursor="String(cursor) === 'true'"
        :style="{ minHeight: `calc(${LINES}lh + 1.5rem)` }"
      >
        <CodeBlockLine
          v-for="(line, index) in lines"
          :key="index"
          :variant="index >= 5 && index <= 9 ? 'highlighted' : 'default'"
        >
          <CodeBlockToken v-for="(token, i) in line" :key="i" :token="token" />
        </CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  </div>
</template>
