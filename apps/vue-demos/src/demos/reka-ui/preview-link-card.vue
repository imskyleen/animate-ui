<script setup lang="ts">
import {
  PreviewLinkCard,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardPortal,
  PreviewLinkCardTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

withDefaults(
  defineProps<{
    followCursor?: boolean | 'x' | 'y'
    href?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
    alignOffset?: number
  }>(),
  {
    followCursor: false,
    href: 'https://animate-ui.com/docs',
    side: 'top',
    sideOffset: 4,
    align: 'center',
    alignOffset: 0,
  },
)
</script>

<template>
  <p class="text-muted-foreground">
    Read the
    <PreviewLinkCard :href="href" :follow-cursor="followCursor">
      <PreviewLinkCardTrigger target="_blank" class="text-foreground underline">
        Animate UI Docs
      </PreviewLinkCardTrigger>
      <PreviewLinkCardPortal>
        <PreviewLinkCardContent
          :side="side"
          :side-offset="Number(sideOffset)"
          :align="align"
          :align-offset="Number(alignOffset)"
          target="_blank"
          class="ring-foreground/10 bg-popover z-50 origin-(--reka-hover-card-content-transform-origin) overflow-hidden rounded-lg shadow-md ring-1 outline-hidden"
        >
          <PreviewLinkCardImage alt="Animate UI Docs" class="block" />
        </PreviewLinkCardContent>
      </PreviewLinkCardPortal>
    </PreviewLinkCard>
    — hover to preview, click to dive in.
  </p>
</template>
