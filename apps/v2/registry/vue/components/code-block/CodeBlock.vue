<script setup lang="ts">
import type { CodeBlockWriteInfo } from '@animate-ui/vue/primitives/code-block'
import type { HTMLAttributes } from 'vue'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CopyButton, CopyButtonIcon } from '@animate-ui/vue/primitives/buttons/copy'
import { CodeBlock as CodeBlockPrimitive } from '@animate-ui/vue/primitives/code-block'
import { cn } from 'cn'
import { shallowRef } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    code: string
    lang: string
    cursor?: boolean
    copyButton?: boolean
    class?: HTMLAttributes['class']
    scrollClass?: HTMLAttributes['class']
  }>(),
  { cursor: true, copyButton: true },
)

const emit = defineEmits<{ done: [], write: [info: CodeBlockWriteInfo] }>()

const scroll = shallowRef<HTMLElement | null>(null)
</script>

<template>
  <div data-slot="code-block-frame" :class="cn('relative', props.class)">
    <div
      ref="scroll"
      :class="cn('max-h-96 overflow-auto rounded-xl bg-accent p-4 text-sm', props.scrollClass)"
    >
      <CodeBlockPrimitive
        v-bind="$attrs"
        :code="props.code"
        :lang="props.lang"
        :scroll-container="scroll"
        :class="cn(
          '[&_code]:text-[13px]! [&>pre,_&_code]:border-none [&>pre,_&_code]:bg-transparent!',
          props.cursor && 'data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:content-[\'|\']',
        )"
        @done="emit('done')"
        @write="(info: CodeBlockWriteInfo) => emit('write', info)"
      />
    </div>
    <CopyButton
      v-if="props.copyButton"
      :content="props.code"
      aria-label="Copy code"
      class="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
    >
      <CopyButtonIcon>
        <template #icon>
          <HugeiconsIcon :icon="Copy01Icon" :stroke-width="2" />
        </template>
        <template #copied-icon>
          <HugeiconsIcon :icon="Tick02Icon" :stroke-width="2" />
        </template>
      </CopyButtonIcon>
    </CopyButton>
  </div>
</template>
