<script setup lang="ts">
import type { CursorFollowAlign, CursorFollowSide } from '@animate-ui/vue/primitives/cursor'
import { Cursor, CursorContainer, CursorFollow, CursorProvider } from '@animate-ui/vue/primitives/cursor'

const props = withDefaults(
  defineProps<{
    global?: boolean | string
    enableCursor?: boolean | string
    enableCursorFollow?: boolean | string
    side?: CursorFollowSide
    sideOffset?: number | string
    align?: CursorFollowAlign
    alignOffset?: number | string
  }>(),
  {
    global: false,
    enableCursor: true,
    enableCursorFollow: true,
    side: 'bottom',
    sideOffset: 15,
    align: 'end',
    alignOffset: 5,
  },
)

const on = (value: boolean | string) => value === true || value === 'true'
</script>

<template>
  <div class="flex h-72 w-full max-w-md items-center justify-center rounded-xl bg-accent">
    <p class="font-medium text-muted-foreground italic">
      Move your pointer over this area
    </p>
    <CursorProvider :global="on(props.global)">
      <CursorContainer>
        <Cursor v-if="on(enableCursor)">
          <svg
            class="size-6 text-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
            />
          </svg>
        </Cursor>
        <CursorFollow
          v-if="on(enableCursorFollow)"
          :side="side"
          :side-offset="Number(sideOffset)"
          :align="align"
          :align-offset="Number(alignOffset)"
        >
          <div class="rounded-md bg-foreground px-2 py-1 text-sm text-background">
            Designer
          </div>
        </CursorFollow>
      </CursorContainer>
    </CursorProvider>
  </div>
</template>
