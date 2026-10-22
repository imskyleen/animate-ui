<script setup lang="ts">
import { Alert02Icon, CheckmarkCircle02Icon, InformationCircleIcon, Loading03Icon, MultiplicationSignCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { computed } from "vue"

const props = defineProps<{ status?: string }>()

const icons = {
  success: { icon: CheckmarkCircle02Icon, class: undefined },
  info: { icon: InformationCircleIcon, class: undefined },
  warning: { icon: Alert02Icon, class: undefined },
  error: { icon: MultiplicationSignCircleIcon, class: "text-destructive" },
  loading: { icon: Loading03Icon, class: "animate-spin" },
} as const

const shown = computed(() => icons[props.status as keyof typeof icons])
</script>

<template>
  <span
    v-if="shown"
    data-slot="toast-icon"
    class="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
  >
    <HugeiconsIcon :icon="shown.icon" :stroke-width="2" :class="shown.class" aria-hidden="true" />
  </span>
</template>
