<script setup lang="ts">
import {
  PreviewLinkCard,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardPortal,
  PreviewLinkCardTrigger,
} from '@animate-ui/vue/primitives/reka-ui'

const CUSTOM_SRC = 'https://screenshots.test/custom.svg'
const cards = [
  { id: 'vue-reka-ui-src', props: { href: 'https://example.com/', src: CUSTOM_SRC } },
  {
    id: 'vue-reka-ui-options',
    props: {
      href: 'https://example.com/',
      width: 320,
      height: 180,
      deviceScaleFactor: 2,
      colorScheme: 'dark' as const,
    },
  },
]
</script>

<template>
  <div class="flex flex-col items-start gap-24 p-10">
    <PreviewLinkCard
      v-for="card in cards"
      :key="card.id"
      v-bind="card.props"
      :open-delay="0"
      :close-delay="0"
    >
      <PreviewLinkCardTrigger>{{ card.id }} link</PreviewLinkCardTrigger>
      <PreviewLinkCardPortal>
        <PreviewLinkCardContent :data-testid="card.id" side="right">
          <PreviewLinkCardImage :alt="`${card.id} image`" />
        </PreviewLinkCardContent>
      </PreviewLinkCardPortal>
    </PreviewLinkCard>
  </div>
</template>
