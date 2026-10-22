import { defineComponent, h, ref, type Component, type PropType } from 'vue';
import {
  PaginationRoot as RekaPaginationRoot,
  type PaginationRootEmits,
  type PaginationRootProps as RekaPaginationRootProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  LEAVING_ATTRIBUTE,
  SLIDING_ATTRIBUTE,
  useSlidingIndicator,
  type SlidingIndicatorConfig,
} from '../../../internal/sliding-indicator';

const ROOT_ATTRIBUTE = 'data-animate-ui-pagination';
const READY_ATTRIBUTE = 'data-animate-ui-pagination-ready';
const SETTLING_ATTRIBUTE = 'data-animate-ui-pagination-settling';
const LINK = '[data-type="page"]';
const ELLIPSIS = '[data-type="ellipsis"]';
const CURRENT = `${LINK}[aria-current="page"]`;
const SLOT = 'pagination-indicator';

const SURFACE_CSS = [
  `[${READY_ATTRIBUTE}] ${CURRENT}:not(:focus-visible){border-color:transparent;box-shadow:none}`,
  // A link without a border of its own (shadcn-vue's ghost) would fade its border out as it becomes current.
  `[${READY_ATTRIBUTE}] ${CURRENT}:not(:focus-visible){transition-property:color,background-color,outline-color,text-decoration-color,fill,stroke,opacity,transform,translate,scale,rotate,filter}`,
  `@media not all and (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}{background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}] ${CURRENT}:not(:hover){background-color:transparent;background-image:none}}`,
  `@media (hover:hover){[${READY_ATTRIBUTE}]:has(${CURRENT}:hover):not(:has([${ROOT_ATTRIBUTE}] ${CURRENT}:hover))>[data-slot="${SLOT}"]:not([${SLIDING_ATTRIBUTE}]):not([${LEAVING_ATTRIBUTE}]){background-color:transparent;background-image:none}}`,
  `[${SETTLING_ATTRIBUTE}] ${CURRENT}{transition:none}`,
  `@layer base{[${READY_ATTRIBUTE}] :is(${LINK},${ELLIPSIS}){position:relative;z-index:2}}`,
].join('');

function findCurrent(root: HTMLElement) {
  for (const link of root.querySelectorAll<HTMLElement>(CURRENT)) {
    if (
      link.closest(`[${ROOT_ATTRIBUTE}]`) === root &&
      link.getClientRects().length > 0
    )
      return link;
  }
  return null;
}

const PAGINATION_INDICATOR: SlidingIndicatorConfig = {
  findActive: findCurrent,
  items: LINK,
  attributes: ['aria-current', 'class', 'data-selected', 'data-disabled'],
  style: { href: 'animate-ui-pagination-indicator', css: SURFACE_CSS },
  slot: SLOT,
  reducedMotion: 'fade',
  fadeBackground: true,
  untransformed: true,
  zIndex: 1,
};

type PaginationRootProps = RekaPaginationRootProps & {
  transition?: Transition;
};

const elementOf = (component: unknown) => {
  let node = (component as { $el?: Node } | null)?.$el ?? null;
  while (node && !(node instanceof HTMLElement)) node = node.nextSibling;
  return node;
};

/** reka-ui's PaginationRoot: the current page's outline slides from page to page. */
const PaginationRoot = defineComponent({
  name: 'PaginationRoot',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const root = ref<HTMLElement | null>(null);
    const { render, ready, settling } = useSlidingIndicator(
      root,
      PAGINATION_INDICATOR,
      () => ({ transition: props.transition }),
    );
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          RekaPaginationRoot as Component,
          {
            ...attrs,
            [ROOT_ATTRIBUTE]: '',
            [READY_ATTRIBUTE]: ready.value ? '' : undefined,
            [SETTLING_ATTRIBUTE]: settling.value ? '' : undefined,
            ref: (component: unknown) => {
              root.value = elementOf(component);
            },
          },
          {
            default: (slotProps: Record<string, unknown>) => [
              render(),
              slots.default?.(slotProps),
            ],
          },
        ),
      );
  },
}) as unknown as typeof RekaPaginationRoot;

export { PaginationRoot, type PaginationRootProps, type PaginationRootEmits };
