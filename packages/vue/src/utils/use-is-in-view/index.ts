import { computed, shallowRef, type ComputedRef, type Ref } from 'vue';
import { useInView } from 'motion-v';

interface UseIsInViewOptions {
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
}

/** Whether the element is in view, or always true when `inView` is off. */
function useIsInView(options: () => UseIsInViewOptions = () => ({})): {
  element: Ref<HTMLElement | null>;
  isInView: ComputedRef<boolean>;
} {
  const element: Ref<HTMLElement | null> = shallowRef(null);
  const { inViewOnce = false, inViewMargin = '0px' } = options();
  const inView = useInView(element, {
    once: inViewOnce,
    margin: inViewMargin as never,
  });
  return {
    element,
    isInView: computed(() => !options().inView || inView.value),
  };
}

export { useIsInView, type UseIsInViewOptions };
