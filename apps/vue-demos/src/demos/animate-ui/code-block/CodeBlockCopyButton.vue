<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"

import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/components/ui/button"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { CopyButton, CopyButtonIcon } from "@animate-ui/vue/primitives/buttons/copy"
import { cn } from "cn"
import { ref } from "vue"
import { Button } from "@/components/ui/button"

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PrimitiveProps & {
  value: string
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  as: "button",
  variant: "ghost",
  size: "icon-xs",
})

const copied = ref(false)
</script>

<template>
  <CopyButton
    as-child
    data-slot="code-block-copy-button"
    :content="props.value"
    :delay="2000"
    @copied-change="(value: boolean) => (copied = value)"
  >
  <Button
    v-bind="$attrs"
    :data-copied="copied || undefined"
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :aria-label="copied ? 'Copied' : 'Copy'"
    :class="cn('', props.class)"
  >
    <CopyButtonIcon>
      <template #icon>
        <HugeiconsIcon :icon="Copy01Icon" :stroke-width="2" />
      </template>
      <template #copied-icon>
        <HugeiconsIcon :icon="Tick02Icon" :stroke-width="2" />
      </template>
    </CopyButtonIcon>
  </Button>
  </CopyButton>
  <span aria-live="polite" class="sr-only">{{ copied ? "Copied" : "" }}</span>
</template>
