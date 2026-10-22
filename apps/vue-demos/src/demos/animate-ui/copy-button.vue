<script setup lang="ts">
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CopyButton, CopyButtonIcon } from '@animate-ui/vue/primitives/buttons/copy'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const copyButtonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        destructive:
          'bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white',
        outline:
          'bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'size-9',
        xs: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'size-8',
        lg: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type CopyButtonVariants = VariantProps<typeof copyButtonVariants>

withDefaults(
  defineProps<{
    variant?: CopyButtonVariants['variant']
    size?: CopyButtonVariants['size']
  }>(),
  { variant: 'default', size: 'default' },
)
</script>

<template>
  <CopyButton
    content="Hello world!"
    aria-label="Copy"
    :class="cn(copyButtonVariants({ variant, size }))"
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
</template>
