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

// The checks of list and menu items (a select's or a combobox's chosen item,
// a menu's checkbox and radio items), shared by the libraries. They stay
// mounted on every item, and show the way their `CheckAnimation` says:
//
// - `draw` (the default): the check draws itself when its item is checked
//   and erases itself when it's unchecked, like a checkbox's
//   (internal/controls/indicator), without its 0.2s delay (there's no box to
//   fill first). Choosing another item of a single selection erases the old
//   check while the new one draws.
// - `pop`: it pops in from half its size out of a light blur, and shrinks
//   back out. Choosing another item of a single selection doesn't pop: the
//   check glides from the item it leaves to the chosen one, on the
//   highlight's spring (its group decides, CheckGroup).
//
// Only checking and unchecking animate: the list or the menu opening shows
// its checks at rest, and closing leaves them as they are.
//
// Choosing an item can close the list or the menu: when its check changes,
// the list holds still first (PICK_HOLD: 250ms for a drawn check, 150ms for
// a glide or a pop), so the change is seen before the list fades out. Each
// check registers with its list (CheckRegistryContext), with how it shows,
// so the list knows which items have one and how long to hold.

/** A drawn check: no box to fill first, it draws at once. */
const DRAW_TRANSITION: Transition = {
  ...motionTokens.transition.check,
  delay: 0,
};
/** Unchecked, it erases itself, as slowly as it draws. */
const ERASE_TRANSITION: Transition = motionTokens.transition.uncheck;
/** A popped check: a lively spring, a little overshoot. */
const POP_TRANSITION: Transition = motionTokens.spring.checkPop;
/** Unchecked, it shrinks back into its blur, quicker. */
const UNPOP_TRANSITION: Transition = motionTokens.transition.popOut;

/**
 * A single selection's check gliding to the chosen item (`pop`): the
 * highlight's spring, so it lands with the highlight, in ~150ms without
 * overshoot.
 */
const GLIDE_TRANSITION = motionTokens.spring.highlight;

/**
 * How long (seconds) a list holds still after an item was chosen, before it
 * closes: the check's change, in sight. A drawn check (0.3s) is ~95% drawn
 * and the old one ~95% erased when the list starts to fade (at 150ms, only
 * two thirds: the list was half gone before they were done); a glide or a
 * pop is nearly done in 150ms.
 */
const PICK_HOLD: Record<CheckAnimation, number> = { draw: 0.25, pop: 0.15 };

/**
 * How the chosen item's check changes as its list closes: the check's
 * animation (the list holds for it), or `false` (it doesn't hold).
 */
type Picked = CheckAnimation | false;

/**
 * A list's hold (seconds, at the app's tempo) for a check that shows the way
 * `look` says.
 */
function usePickHold() {
  const { delay: draw = 0 } = useTempoTransition({ delay: PICK_HOLD.draw });
  const { delay: pop = 0 } = useTempoTransition({ delay: PICK_HOLD.pop });
  return (look: CheckAnimation) => (look === 'draw' ? draw : pop);
}

/** Animate UI's additions to the parts that show an item's check. */
type ItemCheckAnimationProps = {
  /**
   * How the check shows and hides: `draw` (it draws itself and erases
   * itself) or `pop` (it pops in from half its size and shrinks back out; a
   * single selection's check glides to the chosen item). Defaults to the
   * closest `AnimateUIProvider`'s `checkAnimation`, or `draw`.
   */
  animation?: CheckAnimation;
  /**
   * Transition of the check showing and hiding, and of its glide. Defaults
   * to 0.3s on Motion's easeOut both ways (`draw`); a spring (stiffness 500,
   * damping 24) in and 0.15s out (`pop`), and a spring (stiffness 500,
   * damping 40) for the glide.
   */
  transition?: Transition;
};

// ---------------------------------------------------------------------------
// Groups: the checks of a single selection.

type GroupReport = {
  handle: IndicatorHandle;
  shown: boolean;
  reduce: boolean;
  glide: Transition;
  /** Where it was, when it's gone from the page (unmounted). */
  rect?: DOMRect;
};

/**
 * The checks of one single selection (a list, a menu's radio group or
 * section) that glide between their items (`pop`). In the commit that moves
 * the selection, the check leaving and the one arriving report to it; once
 * the commit is over (before the next frame), it pairs them: the new check
 * shows at once and glides from where the old one is, which hides at once.
 * Alone, a check pops in or out.
 */
type CheckGroup = { report: (report: GroupReport) => void };

function createCheckGroup(): CheckGroup {
  let pending: GroupReport[] = [];
  const settle = () => {
    const reports = pending;
    pending = [];
    // A check reported twice in a commit: its last report counts.
    const last = new Map(reports.map((r) => [r.handle.element, r]));
    const shown = [...last.values()].filter((r) => r.shown);
    const hidden = [...last.values()].filter((r) => !r.shown);
    const to = shown.length === 1 ? shown[0]! : null;
    // The check leaving, as it is on screen (gliding, maybe).
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

/** A single selection's group, for its checks to glide between its items. */
function useCheckGroup(): CheckGroup {
  const [group] = React.useState(createCheckGroup);
  return group;
}

// ---------------------------------------------------------------------------
// Registry: which items have a check.

type RegisterCheck = (element: Element, look: CheckAnimation) => () => void;

/** The list's registry of checks, with how each one shows. */
const CheckRegistryContext = React.createContext<RegisterCheck | null>(null);

/**
 * A list's registry: `checkOf(item)` tells, when `item` is chosen, how the
 * check it changes shows (`draw` if one of its checks draws itself), or
 * `false` without one (without `item`: any item's); `hasCheck` whether it
 * has one.
 */
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

// ---------------------------------------------------------------------------
// The check.

type ItemCheckProps = Omit<
  IndicatorContentProps,
  'kind' | 'animation' | 'transition' | 'exitTransition' | 'coordinate'
> &
  ItemCheckAnimationProps & {
    /** A multiple selection's (or a checkbox item's): it shows on its own. */
    multiple: boolean;
    /** Its single selection's group, for `pop`'s glide. */
    group: CheckGroup | null;
  };

/** Lists and menus on the page since an earlier frame. */
const settledLists = new WeakSet<Element>();

/**
 * Whether `check` mounts in a list that was already there: it was just
 * checked (an indicator rendered for the chosen item only). Mounting with its
 * list (it opens), it's at rest.
 */
function inSettledList(check: Element | null) {
  const list = check?.closest('[role="menu"], [role="listbox"]');
  if (!list) return true;
  if (settledLists.has(list)) return true;
  requestAnimationFrame(() => settledLists.add(list));
  return false;
}

/**
 * A list or menu item's check, kept mounted: its content (the icon) shows
 * when the item is checked, and hides when it's unchecked; the list opening
 * shows it at rest. Under reduced motion, it only fades.
 */
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
  // Registered with how it shows: its list holds longer for a drawn check.
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    return element && register ? register(element, look) : undefined;
  }, [register, look]);
  // Gliding, it must be a box: a translate doesn't apply to an inline one.
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
  // Rendered only while its item is chosen (`isSelected && <Indicator>`): it
  // leaves the page as the new one arrives, which glides from where it was.
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
    // Out of the list's or the menu's presence: it doesn't leave as they do.
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

/**
 * A ref for a check's element: transforms (its glide) don't apply to an
 * inline box, and an indicator is often a plain `<span>` inside the
 * positioned one. Alone in it, it becomes a block, which lays out the same (an
 * inline-level box would sit 2-4px off, on the line's baseline); beside text,
 * an inline block, which keeps its line.
 */
function asTransformable(node: HTMLElement | null) {
  if (!node || getComputedStyle(node).display !== 'inline') return;
  const alone = node.parentElement?.childNodes.length === 1;
  node.style.setProperty('display', alone ? 'block' : 'inline-block');
}

// ---------------------------------------------------------------------------
// Picks: holding a closing list while the chosen item's check changes.

type Picks = {
  /**
   * An item is being chosen and its check changes, the way `look` says:
   * call it right before the library closes the menu.
   */
  markPick: (look: CheckAnimation) => void;
  /** Whether `item` has a check (without `item`: whether any item has one). */
  hasCheck: (item?: Element | null) => boolean;
  /** How `item`'s check shows (see `useCheckRegistry`). */
  checkOf: (item?: Element | null) => Picked;
};

/** The picks of the menu or list an item is in. */
const PickContext = React.createContext<Picks | null>(null);

/**
 * A menu's picks. `wasPicked()`, read when it closes, tells how the check of
 * an item just chosen changes, or `false` (the close follows the pick, in the
 * same event or in the render it schedules).
 */
function usePicks() {
  const { registerCheck, hasCheck, checkOf } = useCheckRegistry();
  const pickingRef = React.useRef<Picked>(false);
  const markPick = React.useCallback((look: CheckAnimation) => {
    // A drawn check, anywhere in the menus picked, is held for.
    if (pickingRef.current !== 'draw') pickingRef.current = look;
    // A pick that doesn't close it (a key that keeps it open) is forgotten
    // with its event, after React has rendered what it scheduled.
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
