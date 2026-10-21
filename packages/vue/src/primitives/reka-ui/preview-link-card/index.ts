import {
  defineComponent,
  h,
  inject,
  provide,
  watch,
  type InjectionKey,
  type PropType,
} from 'vue';
import type {
  HoverCardArrowProps,
  HoverCardContentProps as RekaHoverCardContentProps,
  HoverCardPortalProps,
  HoverCardTriggerProps,
} from 'reka-ui';

import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  type HoverCardRootProps,
} from '../hover-card';

type PreviewImageOptions = {
  src?: string;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  colorScheme?: 'light' | 'dark';
};

type PreviewLinkCardContextType = {
  href: () => string;
  src: () => string;
  width: () => number;
  height: () => number;
};

type PreviewLinkCardProps = HoverCardRootProps &
  PreviewImageOptions & { href: string };
type PreviewLinkCardTriggerProps = HoverCardTriggerProps & { href?: string };
type PreviewLinkCardPortalProps = HoverCardPortalProps;
type PreviewLinkCardContentProps = RekaHoverCardContentProps & {
  href?: string;
  target?: string;
  rel?: string;
};
type PreviewLinkCardArrowProps = HoverCardArrowProps;

const PreviewLinkCardKey: InjectionKey<PreviewLinkCardContextType> = Symbol(
  'AnimateUIPreviewLinkCard',
);

function usePreviewLinkCard() {
  const context = inject(PreviewLinkCardKey, null);
  if (!context)
    throw new Error('PreviewLinkCard parts must be used within PreviewLinkCard');
  return context;
}

function buildPreviewSrc({
  href,
  width,
  height,
  deviceScaleFactor,
  colorScheme,
}: Required<Omit<PreviewImageOptions, 'src'>> & { href: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({
    url: href,
    screenshot: true,
    meta: false,
    embed: 'screenshot.url',
    colorScheme,
    'viewport.isMobile': true,
    'viewport.deviceScaleFactor': deviceScaleFactor,
    'viewport.width': width * 3,
    'viewport.height': height * 3,
  }))
    search.append(key, String(value));
  return `https://api.microlink.io/?${search.toString()}`;
}

/** A hover card previewing a link: a screenshot of the page, preloaded. */
const PreviewLinkCard = defineComponent({
  name: 'PreviewLinkCard',
  inheritAttrs: false,
  props: {
    href: { type: String, required: true },
    src: String,
    width: { type: Number, default: 240 },
    height: { type: Number, default: 135 },
    deviceScaleFactor: { type: Number, default: 1 },
    colorScheme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light',
    },
  },
  setup(props, { attrs, slots }) {
    const src = () =>
      props.src ??
      buildPreviewSrc({
        href: props.href,
        width: props.width,
        height: props.height,
        deviceScaleFactor: props.deviceScaleFactor,
        colorScheme: props.colorScheme,
      });
    provide(PreviewLinkCardKey, {
      href: () => props.href,
      src,
      width: () => props.width,
      height: () => props.height,
    });
    watch(
      src,
      (href, _, onCleanup) => {
        if (typeof document === 'undefined') return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = href;
        document.head.appendChild(link);
        onCleanup(() => link.remove());
      },
      { immediate: true, flush: 'post' },
    );
    return () => h(HoverCardRoot, attrs, slots);
  },
});

const PreviewLinkCardTrigger = defineComponent({
  name: 'PreviewLinkCardTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = usePreviewLinkCard();
    return () =>
      h(
        HoverCardTrigger,
        {
          'data-slot': 'preview-link-card-trigger',
          ...attrs,
          href: (attrs.href as string | undefined) ?? context.href(),
        },
        slots,
      );
  },
});

const PreviewLinkCardPortal = defineComponent({
  name: 'PreviewLinkCardPortal',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        HoverCardPortal,
        { 'data-slot': 'preview-link-card-portal', ...attrs },
        slots,
      );
  },
});

/** The card: a link to the page, opening above its trigger by default. */
const PreviewLinkCardContent = defineComponent({
  name: 'PreviewLinkCardContent',
  inheritAttrs: false,
  props: {
    side: {
      type: String as PropType<RekaHoverCardContentProps['side']>,
      default: 'top',
    },
    sideOffset: { type: Number, default: 10 },
    align: {
      type: String as PropType<RekaHoverCardContentProps['align']>,
      default: 'center',
    },
    href: String,
  },
  setup(props, { attrs, slots }) {
    const context = usePreviewLinkCard();
    return () => {
      const asChild = attrs.asChild === '' || attrs.asChild === true;
      return h(
        HoverCardContent,
        {
          'data-slot': 'preview-link-card-content',
          side: props.side,
          sideOffset: props.sideOffset,
          align: props.align,
          ...attrs,
          ...(asChild
            ? {}
            : {
                as: 'a',
                href: props.href ?? context.href(),
                style: [{ display: 'block' }, attrs.style],
              }),
        },
        slots,
      );
    };
  },
});

const PreviewLinkCardImage = defineComponent({
  name: 'PreviewLinkCardImage',
  inheritAttrs: false,
  props: { alt: { type: String, default: 'preview image' } },
  setup(props, { attrs }) {
    const context = usePreviewLinkCard();
    return () =>
      h('img', {
        'data-slot': 'preview-link-card-image',
        src: context.src(),
        width: context.width(),
        height: context.height(),
        alt: props.alt,
        ...attrs,
      });
  },
});

const PreviewLinkCardArrow = defineComponent({
  name: 'PreviewLinkCardArrow',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        HoverCardArrow,
        { 'data-slot': 'preview-link-card-arrow', ...attrs },
        slots,
      );
  },
});

export {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardPortal,
  PreviewLinkCardContent,
  PreviewLinkCardImage,
  PreviewLinkCardArrow,
  usePreviewLinkCard,
  type PreviewLinkCardProps,
  type PreviewLinkCardTriggerProps,
  type PreviewLinkCardPortalProps,
  type PreviewLinkCardContentProps,
  type PreviewLinkCardArrowProps,
  type PreviewLinkCardContextType,
};
