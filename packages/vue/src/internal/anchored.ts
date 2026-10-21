import { computed, ref, watch, type ComputedRef } from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

export const POPOVER_TRANSITION = motionTokens.spring.pop;
export const MENU_TRANSITION = motionTokens.transition.menu;

export const HIDDEN_SCALE = {
  tooltip: motionTokens.scale.tooltip,
  popover: motionTokens.scale.popover,
  menu: motionTokens.scale.menu,
} as const;

const DEFAULT_TRANSITION = {
  tooltip: POPOVER_TRANSITION,
  popover: POPOVER_TRANSITION,
  menu: MENU_TRANSITION,
} as const;

export type AnchoredKind = keyof typeof HIDDEN_SCALE;

export type AnchoredAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type Target = Record<string, unknown>;

export type AnchoredMotionProps = {
  initial: false | Target;
  animate: Target;
  style?: Record<string, string>;
};

const WARM_WINDOW = 300;

const tooltipGroup = {
  open: new Set<symbol>(),
  warm: false,
  coolDown: undefined as ReturnType<typeof setTimeout> | undefined,
  leaving: new Map<symbol, () => void>(),
};

/**
 * A tooltip opened while another one is showing (or just closed) appears at
 * once, and the one it replaces disappears at once.
 */
function useWarmTooltip(open: () => boolean, enabled: () => boolean) {
  const id = Symbol('tooltip');
  const atOnce = ref(enabled() && open() && tooltipGroup.warm);
  const cut = ref(false);

  watch(
    open,
    (now) => {
      if (now) cut.value = false;
      atOnce.value =
        enabled() &&
        (now
          ? tooltipGroup.warm
          : [...tooltipGroup.open].some((other) => other !== id));
    },
    { flush: 'sync' },
  );

  watch(
    () => [enabled(), open()] as const,
    ([on, now], _, onCleanup) => {
      if (!on) return;
      if (now) {
        tooltipGroup.open.add(id);
        tooltipGroup.warm = true;
        clearTimeout(tooltipGroup.coolDown);
        if (atOnce.value)
          for (const hide of tooltipGroup.leaving.values()) hide();
        onCleanup(() => {
          tooltipGroup.open.delete(id);
          if (tooltipGroup.open.size > 0) return;
          clearTimeout(tooltipGroup.coolDown);
          tooltipGroup.coolDown = setTimeout(() => {
            tooltipGroup.warm = false;
          }, WARM_WINDOW);
        });
      } else {
        tooltipGroup.leaving.set(id, () => (cut.value = true));
        onCleanup(() => tooltipGroup.leaving.delete(id));
      }
    },
    { immediate: true, flush: 'post' },
  );

  return {
    appearAtOnce: () => open() && atOnce.value,
    hideAtOnce: () => !open() && (atOnce.value || cut.value),
  };
}

export function useAnchoredMotion(
  options: () => AnchoredAnimationProps & {
    kind?: AnchoredKind;
    open: boolean;
    keepMounted?: boolean;
    instant?: boolean;
  },
): ComputedRef<AnchoredMotionProps> & { settled: (target: Target) => void } {
  const reduce = useShouldReduceMotion();
  const kind = () => options().kind ?? 'popover';
  const warm = useWarmTooltip(
    () => options().open,
    () => kind() === 'tooltip' && options().instant === undefined,
  );
  const enter = useTempoTransition(
    () => options().transition ?? DEFAULT_TRANSITION[kind()],
  );
  const leave = useTempoTransition(
    () =>
      options().exitTransition ??
      options().transition ??
      DEFAULT_TRANSITION[kind()],
  );
  const settledClosed = ref(Boolean(options().keepMounted) && !options().open);
  watch(
    () => options().open,
    (open) => {
      if (open) settledClosed.value = false;
    },
    { flush: 'sync' },
  );

  const props = computed<AnchoredMotionProps>(() => {
    const { open, keepMounted, instant } = options();
    const hidden = {
      opacity: 0,
      scale: reduce.value ? 1 : HIDDEN_SCALE[kind()],
    };
    const none = { duration: 0 };
    const appearAtOnce = instant || warm.appearAtOnce();
    return {
      initial: appearAtOnce || !open ? false : hidden,
      animate: open
        ? {
            opacity: 1,
            scale: 1,
            transition: appearAtOnce ? none : enter.value,
          }
        : {
            ...hidden,
            transition: instant ? none : leave.value,
          },
      style:
        warm.hideAtOnce() || (keepMounted && !open && settledClosed.value)
          ? { visibility: 'hidden' }
          : undefined,
    };
  });

  return Object.assign(props, {
    settled: (target: Target) => {
      if (!options().open && target.opacity === 0) settledClosed.value = true;
    },
  });
}
