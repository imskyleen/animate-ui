'use client';

import * as React from 'react';
import { PresenceContext, type Transition } from 'motion/react';

import {
  motionTokens,
  useCheckAnimation,
  useShouldReduceMotion,
  useTempoTransition,
  type CheckAnimation,
} from '../utils/motion';
import {
  IndicatorContent,
  mergeRefs,
  type IndicatorContentProps,
  type IndicatorHandle,
} from './controls/indicator';
import { glideFrom, stopGlide } from './glide';

const DRAW_TRANSITION: Transition = {
  ...motionTokens.transition.check,
  delay: 0,
};
const ERASE_TRANSITION: Transition = motionTokens.transition.uncheck;
const POP_TRANSITION: Transition = motionTokens.spring.checkPop;
const UNPOP_TRANSITION: Transition = motionTokens.transition.popOut;

const GLIDE_TRANSITION = motionTokens.spring.highlight;

const PICK_HOLD: Record<CheckAnimation, number> = { draw: 0.25, pop: 0.15 };

type Picked = CheckAnimation | false;

function usePickHold() {
  const { delay: draw = 0 } = useTempoTransition({ delay: PICK_HOLD.draw });
  const { delay: pop = 0 } = useTempoTransition({ delay: PICK_HOLD.pop });
  return (look: CheckAnimation) => (look === 'draw' ? draw : pop);
}

type ItemCheckAnimationProps = {
  animation?: CheckAnimation;
  transition?: Transition;
};

type GroupReport = {
  handle: IndicatorHandle;
  shown: boolean;
  reduce: boolean;
  glide: Transition;
  rect?: DOMRect;
};

type CheckGroup = { report: (report: GroupReport) => void };

function createCheckGroup(): CheckGroup {
  let pending: GroupReport[] = [];
  const settle = () => {
    const reports = pending;
    pending = [];
    const last = new Map(reports.map((r) => [r.handle.element, r]));
    const shown = [...last.values()].filter((r) => r.shown);
    const hidden = [...last.values()].filter((r) => !r.shown);
    const to = shown.length === 1 ? shown[0]! : null;
    const from =
      to && !to.reduce ? hidden.find((r) => r.handle.isShown()) : undefined;
    if (to && from) {
      const start = from.rect ?? from.handle.element.getBoundingClientRect();
      for (const r of hidden) {
        stopGlide(r.handle.element);
        r.handle.toggle(false, false);
      }
      to.handle.toggle(true, false);
      glideFrom(to.handle.element, start, to.glide);
      return;
    }
    for (const r of hidden) r.handle.toggle(false, true);
    for (const r of shown) r.handle.toggle(true, true);
  };
  return {
    report: (report) => {
      if (pending.length === 0) queueMicrotask(settle);
      pending.push(report);
    },
  };
}

function useCheckGroup(): CheckGroup {
  const [group] = React.useState(createCheckGroup);
  return group;
}

type RegisterCheck = (element: Element, look: CheckAnimation) => () => void;

const CheckRegistryContext = React.createContext<RegisterCheck | null>(null);

function useCheckRegistry() {
  const checksRef = React.useRef(new Map<Element, CheckAnimation>());
  const registerCheck = React.useCallback<RegisterCheck>((element, look) => {
    checksRef.current.set(element, look);
    return () => {
      checksRef.current.delete(element);
    };
  }, []);
  const checkOf = React.useCallback((item?: Element | null): Picked => {
    let found: Picked = false;
    for (const [check, look] of checksRef.current) {
      if (item && !item.contains(check)) continue;
      if (look === 'draw') return 'draw';
      found = look;
    }
    return found;
  }, []);
  const hasCheck = React.useCallback(
    (item?: Element | null) => checkOf(item) !== false,
    [checkOf],
  );
  return { registerCheck, hasCheck, checkOf };
}

type ItemCheckProps = Omit<
  IndicatorContentProps,
  'kind' | 'animation' | 'transition' | 'exitTransition' | 'coordinate'
> &
  ItemCheckAnimationProps & {
    multiple: boolean;
    group: CheckGroup | null;
  };

const settledLists = new WeakSet<Element>();

function inSettledList(check: Element | null) {
  const list = check?.closest('[role="menu"], [role="listbox"]');
  if (!list) return true;
  if (settledLists.has(list)) return true;
  requestAnimationFrame(() => settledLists.add(list));
  return false;
}

function ItemCheck({
  multiple,
  group,
  animation,
  transition,
  ref,
  ...props
}: ItemCheckProps) {
  const look = useCheckAnimation(animation);
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(transition ?? GLIDE_TRANSITION);
  const gliding = look === 'pop' && !multiple && group !== null;
  const register = React.use(CheckRegistryContext);
  const elementRef = React.useRef<HTMLElement>(null);
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    return element && register ? register(element, look) : undefined;
  }, [register, look]);
  const mergedRef = React.useMemo(
    () =>
      mergeRefs<HTMLElement>(
        ref as React.Ref<HTMLElement> | undefined,
        elementRef,
        gliding ? asTransformable : undefined,
      ),
    [ref, gliding],
  );
  const coordinate = React.useCallback(
    (handle: IndicatorHandle, shown: boolean) =>
      group?.report({ handle, shown, reduce, glide }),
    [group, reduce, glide],
  );
  const latestRef = React.useRef({ checked: props.checked, reduce, glide });
  React.useLayoutEffect(() => {
    latestRef.current = { checked: props.checked, reduce, glide };
  });
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!gliding || !group || !element) return undefined;
    return () => {
      const { checked, ...latest } = latestRef.current;
      if (!checked || !element.isConnected) return;
      group.report({
        handle: { element, toggle: () => {}, isShown: () => true },
        shown: false,
        rect: element.getBoundingClientRect(),
        ...latest,
      });
    };
  }, [gliding, group]);
  const [enter, exit] =
    look === 'pop'
      ? [POP_TRANSITION, UNPOP_TRANSITION]
      : [DRAW_TRANSITION, ERASE_TRANSITION];

  return (
    <PresenceContext value={null}>
      <IndicatorContent
        {...props}
        ref={mergedRef}
        kind="check"
        animation={look}
        transition={transition ?? enter}
        exitTransition={transition ?? exit}
        coordinate={gliding ? coordinate : undefined}
        animateOnMount={() => inSettledList(elementRef.current)}
      />
    </PresenceContext>
  );
}

function asTransformable(node: HTMLElement | null) {
  if (!node || getComputedStyle(node).display !== 'inline') return;
  const alone = node.parentElement?.childNodes.length === 1;
  node.style.setProperty('display', alone ? 'block' : 'inline-block');
}

type Picks = {
  markPick: (look: CheckAnimation) => void;
  hasCheck: (item?: Element | null) => boolean;
  checkOf: (item?: Element | null) => Picked;
};

const PickContext = React.createContext<Picks | null>(null);

function usePicks() {
  const { registerCheck, hasCheck, checkOf } = useCheckRegistry();
  const pickingRef = React.useRef<Picked>(false);
  const markPick = React.useCallback((look: CheckAnimation) => {
    if (pickingRef.current !== 'draw') pickingRef.current = look;
    setTimeout(() => {
      pickingRef.current = false;
    });
  }, []);
  const wasPicked = React.useCallback(() => pickingRef.current, []);
  const picks = React.useMemo(
    () => ({ markPick, hasCheck, checkOf }),
    [markPick, hasCheck, checkOf],
  );
  return { picks, registerCheck, wasPicked };
}

export {
  GLIDE_TRANSITION,
  PICK_HOLD,
  CheckRegistryContext,
  usePickHold,
  ItemCheck,
  PickContext,
  useCheckGroup,
  useCheckRegistry,
  usePicks,
  type CheckGroup,
  type ItemCheckAnimationProps,
  type ItemCheckProps,
  type Picked,
  type RegisterCheck,
};
