import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type Component,
  type InjectionKey,
} from 'vue';

import { Button, type ButtonProps } from '../button';
import { callHandler } from '../_button';
import {
  Particles,
  ParticlesEffect,
  type ParticlesEffectProps,
} from '../../effects/particles';

type IconButtonContextType = {
  bursts: () => number;
};

const IconButtonKey: InjectionKey<IconButtonContextType> = Symbol(
  'AnimateUIIconButton',
);

function useIconButton() {
  const context = inject(IconButtonKey, null);
  if (!context)
    throw new Error('useIconButton must be used within an IconButton');
  return context;
}

type IconButtonProps = ButtonProps;

/** A button whose clicks can burst particles out of it. */
const IconButton = defineComponent({
  name: 'IconButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const bursts = ref(0);
    provide(IconButtonKey, { bursts: () => bursts.value });
    return () =>
      h(
        Button as Component,
        {
          'data-slot': 'icon-button',
          ...attrs,
          style: [{ position: 'relative' }, attrs.style],
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event);
            bursts.value += 1;
          },
        },
        slots,
      );
  },
});

type IconButtonParticlesProps = ParticlesEffectProps & {
  size?: number;
};

const LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

/** The particles a click bursts out of the IconButton. */
const IconButtonParticles = defineComponent({
  name: 'IconButtonParticles',
  inheritAttrs: false,
  props: {
    size: { type: Number, default: 4 },
  },
  setup(props, { attrs }) {
    const { bursts } = useIconButton();
    return () =>
      h(
        Particles as Component,
        {
          asChild: true,
          animate: bursts() > 0,
          'data-slot': 'icon-button-particles',
          style: LAYER_STYLE,
        },
        () =>
          h(
            'span',
            { 'aria-hidden': 'true' },
            h(ParticlesEffect as Component, {
              key: bursts(),
              ...attrs,
              style: [
                {
                  backgroundColor: 'currentcolor',
                  borderRadius: '50%',
                  width: `${props.size}px`,
                  height: `${props.size}px`,
                },
                attrs.style,
              ],
            }),
          ),
      );
  },
});

export {
  IconButton,
  IconButtonParticles,
  useIconButton,
  type IconButtonProps,
  type IconButtonParticlesProps,
  type IconButtonContextType,
};
