import { cva } from 'class-variance-authority'

export const themeTogglerButtonVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center rounded-lg transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        outline:
          'bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
      },
      size: {
        default: 'size-9',
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
