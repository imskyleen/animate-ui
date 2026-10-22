<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { OTPInput } from '@animate-ui/vue/primitives/input-otp'
import { cn } from 'cn'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ class?: HTMLAttributes['class'], containerClass?: string }>()
</script>

<template>
  <OTPInput
    v-slot="slotProps"
    v-bind="$attrs"
    data-slot="input-otp"
    :container-class="cn('gap-2 flex items-center has-disabled:opacity-50', props.containerClass)"
    :spellcheck="false"
    :class="cn('disabled:cursor-not-allowed', props.class)"
  >
    <slot v-bind="slotProps" />
  </OTPInput>
</template>
