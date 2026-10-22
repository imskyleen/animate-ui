import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  type Component,
  type PropType,
} from 'vue';
import { motion, type Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';

const COARSE_QUERY = '(pointer: coarse)';

function useIsTouch() {
  const isTouch = ref(false);
  let query: MediaQueryList | null = null;
  const update = () => (isTouch.value = query?.matches ?? false);
  onMounted(() => {
    query = window.matchMedia(COARSE_QUERY);
    update();
    query.addEventListener('change', update);
  });
  onBeforeUnmount(() => query?.removeEventListener('change', update));
  return isTouch;
}

type ImageZoomProps = {
  zoomScale?: number;
  transition?: Transition;
  zoomOnClick?: boolean;
  zoomOnHover?: boolean;
  disabled?: boolean;
  width?: string;
  height?: string;
};

const call = (handler: unknown, event: Event) =>
  (handler as ((e: Event) => void) | undefined)?.(event);

/** An image that zooms in under the pointer, on hover or click. */
const ImageZoom = defineComponent({
  name: 'ImageZoom',
  inheritAttrs: false,
  props: {
    zoomScale: { type: Number, default: 3 },
    transition: {
      type: Object as PropType<Transition>,
      default: () => ({ type: 'spring', stiffness: 200, damping: 28 }),
    },
    zoomOnClick: { type: Boolean, default: true },
    zoomOnHover: { type: Boolean, default: true },
    disabled: Boolean,
    width: { type: String, default: '100%' },
    height: { type: String, default: '100%' },
  },
  setup(props, { attrs, slots }) {
    const isZoomed = ref(false);
    const container = shallowRef<HTMLElement | null>(null);
    const isTouch = useIsTouch();

    const setOriginFromEvent = (event: MouseEvent | TouchEvent) => {
      const el = container.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in event && event.touches[0]) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const child = el.firstElementChild as HTMLElement | null;
      if (child) child.style.transformOrigin = `${x}px ${y}px`;
    };

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: container,
          role: 'img',
          style: [
            {
              overflow: 'hidden',
              position: 'relative',
              width: props.width,
              height: props.height,
              touchAction: 'manipulation',
              cursor: props.disabled
                ? 'default'
                : isZoomed.value
                  ? 'zoom-out'
                  : 'zoom-in',
            },
            attrs.style,
          ],
          onMouseenter: (event: MouseEvent) => {
            if (!props.disabled && !isTouch.value && props.zoomOnHover)
              isZoomed.value = true;
            call(attrs.onMouseenter, event);
          },
          onMouseleave: (event: MouseEvent) => {
            if (!props.disabled && !isTouch.value && props.zoomOnHover)
              isZoomed.value = false;
            call(attrs.onMouseleave, event);
          },
          onMousemove: (event: MouseEvent) => {
            if (!props.disabled && !isTouch.value) setOriginFromEvent(event);
            call(attrs.onMousemove, event);
          },
          onClick: (event: MouseEvent) => {
            if (!props.disabled && props.zoomOnClick) {
              setOriginFromEvent(event);
              isZoomed.value = !isZoomed.value;
            }
            call(attrs.onClick, event);
          },
          onTouchstart: (event: TouchEvent) => {
            if (!props.disabled) {
              setOriginFromEvent(event);
              if (!props.zoomOnClick) isZoomed.value = true;
            }
            call(attrs.onTouchstart, event);
          },
          onTouchmove: (event: TouchEvent) => {
            if (!props.disabled) setOriginFromEvent(event);
            call(attrs.onTouchmove, event);
          },
          onTouchend: (event: TouchEvent) => {
            if (!props.disabled && !props.zoomOnClick) isZoomed.value = false;
            call(attrs.onTouchend, event);
          },
        },
        h(ReducedMotionConfig, null, () =>
          h(
            motion.div as Component,
            {
              animate: {
                scale: props.disabled
                  ? 1
                  : isZoomed.value
                    ? props.zoomScale
                    : 1,
              },
              transition: props.transition,
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform',
              },
            },
            slots,
          ),
        ),
      );
  },
});

type ImageProps = { objectFit?: string; as?: string | Component };

/** The image inside ImageZoom: it covers the box and lets the pointer through. */
const Image = defineComponent({
  name: 'Image',
  inheritAttrs: false,
  props: {
    objectFit: { type: String, default: 'cover' },
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'img',
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        props.as,
        {
          draggable: false,
          ...attrs,
          style: [
            {
              width: '100%',
              height: '100%',
              objectFit: props.objectFit,
              userSelect: 'none',
              pointerEvents: 'none',
            },
            attrs.style,
          ],
        },
        slots,
      );
  },
});

export { ImageZoom, Image, type ImageZoomProps, type ImageProps };
