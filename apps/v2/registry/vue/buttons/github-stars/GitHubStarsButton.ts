import type { VariantProps } from 'class-variance-authority'
import type { PropType } from 'vue'
import { Button } from '@animate-ui/vue/primitives/buttons/button'
import { GithubStars } from '@animate-ui/vue/primitives/github-stars'
import { cn } from 'cn'
import { defineComponent, h } from 'vue'
import { githubStarsButtonVariants } from './variants'

type Variants = VariantProps<typeof githubStarsButtonVariants>

// A render function, so the child of `as-child` reaches the Button as it is.
export const GitHubStarsButton = defineComponent({
  name: 'GitHubStarsButton',
  inheritAttrs: false,
  props: {
    username: String,
    repo: String,
    value: { type: Number, default: undefined },
    delay: { type: Number, default: 0 },
    inView: Boolean,
    inViewMargin: { type: String, default: '0px' },
    inViewOnce: { type: Boolean, default: true },
    variant: String as PropType<Variants['variant']>,
    size: String as PropType<Variants['size']>,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        GithubStars,
        {
          asChild: true,
          username: props.username,
          repo: props.repo,
          value: props.value,
          delay: props.delay,
          inView: props.inView,
          inViewMargin: props.inViewMargin,
          inViewOnce: props.inViewOnce,
        },
        () =>
          h(
            Button,
            {
              ...attrs,
              'data-slot': 'github-stars-button',
              'class': cn(
                githubStarsButtonVariants({ variant: props.variant, size: props.size }),
                attrs.class as string,
              ),
            },
            slots,
          ),
      )
  },
})
