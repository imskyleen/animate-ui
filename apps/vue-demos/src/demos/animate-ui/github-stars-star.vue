<script setup lang="ts">
import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from 'cn'
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <HugeiconsIcon
    :icon="StarIcon"
    :stroke-width="2"
    v-bind="attrs"
    :class="cn('[&_path]:[stroke:inherit]', attrs.class as string)"
  />
</template>
