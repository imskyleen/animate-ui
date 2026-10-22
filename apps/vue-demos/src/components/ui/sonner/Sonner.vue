<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Alert02Icon, Cancel01Icon, CheckmarkCircle02Icon, InformationCircleIcon, Loading03Icon, MultiplicationSignCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/vue"
import { cn } from "cn"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <HugeiconsIcon :icon="CheckmarkCircle02Icon" :stroke-width="2" class="size-4" />
    </template>
    <template #info-icon>
      <HugeiconsIcon :icon="InformationCircleIcon" :stroke-width="2" class="size-4" />
    </template>
    <template #warning-icon>
      <HugeiconsIcon :icon="Alert02Icon" :stroke-width="2" class="size-4" />
    </template>
    <template #error-icon>
      <HugeiconsIcon :icon="MultiplicationSignCircleIcon" :stroke-width="2" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <HugeiconsIcon :icon="Loading03Icon" :stroke-width="2" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <HugeiconsIcon :icon="Cancel01Icon" :stroke-width="2" class="size-4" />
    </template>
  </Sonner>
</template>
