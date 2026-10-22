import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  type Component,
  type InjectionKey,
  type PropType,
} from 'vue';
import type { Transition } from 'motion-v';

import { Button, type ButtonProps } from '../button';
import { IconSwap } from '../_icon-swap';
import { callHandler } from '../../../internal/handlers';

type CopyButtonContextType = {
  copied: () => boolean;
};

const CopyButtonKey: InjectionKey<CopyButtonContextType> = Symbol(
  'AnimateUICopyButton',
);

function useCopyButton() {
  const context = inject(CopyButtonKey, null);
  if (!context)
    throw new Error('useCopyButton must be used within a CopyButton');
  return context;
}

type CopyButtonProps = ButtonProps & {
  content: string;
  copied?: boolean;
  defaultCopied?: boolean;
  delay?: number;
};

/** Copies `content` on click, then tells its icon it was copied. */
const CopyButton = defineComponent({
  name: 'CopyButton',
  inheritAttrs: false,
  props: {
    content: { type: String, required: true },
    copied: { type: Boolean, default: undefined },
    defaultCopied: Boolean,
    delay: { type: Number, default: 3000 },
  },
  emits: ['update:copied', 'copiedChange'],
  setup(props, { attrs, slots, emit }) {
    const own = ref(props.defaultCopied);
    const isCopied = computed(() => props.copied ?? own.value);
    const setCopied = (value: boolean, content?: string) => {
      own.value = value;
      emit('update:copied', value);
      emit('copiedChange', value, content);
    };
    let timeout: ReturnType<typeof setTimeout> | undefined;
    onBeforeUnmount(() => clearTimeout(timeout));

    const handleClick = (event: MouseEvent) => {
      callHandler(attrs.onClick, event);
      if (event.defaultPrevented || props.copied || !props.content) return;
      const content = props.content;
      Promise.resolve()
        .then(() => navigator.clipboard.writeText(content))
        .then(() => {
          setCopied(true, content);
          clearTimeout(timeout);
          timeout = setTimeout(() => setCopied(false), props.delay);
        })
        .catch((error) => {
          console.error('Animate UI CopyButton: could not copy', error);
        });
    };

    provide(CopyButtonKey, { copied: () => isCopied.value });
    return () =>
      h(
        Button as Component,
        {
          'data-slot': 'copy-button',
          'data-copied': isCopied.value ? '' : undefined,
          ...attrs,
          onClick: handleClick,
        },
        slots,
      );
  },
});

type CopyButtonIconProps = {
  transition?: Transition;
};

/** Shows the `icon` slot, swapped for the `copied-icon` slot once copied. */
const CopyButtonIcon = defineComponent({
  name: 'CopyButtonIcon',
  inheritAttrs: false,
  props: {
    transition: Object as PropType<Transition>,
  },
  setup(props, { attrs, slots }) {
    const { copied } = useCopyButton();
    return () =>
      h(
        IconSwap as Component,
        {
          'data-slot': 'copy-button-icon',
          swapKey: copied() ? 'copied' : 'copy',
          transition: props.transition,
          ...attrs,
        },
        () => (copied() ? slots['copied-icon']?.() : slots.icon?.()),
      );
  },
});

export {
  CopyButton,
  CopyButtonIcon,
  useCopyButton,
  type CopyButtonProps,
  type CopyButtonIconProps,
  type CopyButtonContextType,
};
