<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "@animate-ui/vue/primitives/reka-ui"
import type { HTMLAttributes } from "vue"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "@animate-ui/vue/primitives/reka-ui"

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn('peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors duration-300 data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 after:absolute after:-inset-x-3 after:-inset-y-2 before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:opacity-0 before:scale-70 before:transition-[scale,opacity] before:duration-300 motion-reduce:before:scale-100 data-[state=checked]:before:opacity-100 data-[state=checked]:before:scale-100 data-[state=indeterminate]:before:opacity-100 data-[state=indeterminate]:before:scale-100 disabled:cursor-not-allowed disabled:opacity-50',
         props.class)"
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="relative grid place-content-center text-current transition-none [&>svg]:size-3.5"
    >
      <slot v-bind="slotProps">
        <HugeiconsIcon :icon="Tick02Icon" :stroke-width="2" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
