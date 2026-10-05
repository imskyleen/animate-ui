'use client';

import * as React from 'react';
import { PresenceContext, type Transition } from 'motion/react';

import { motionTokens } from '../utils/motion';
import {
  IndicatorContent,
  type IndicatorContentProps,
} from './controls/indicator';

// The checks of list and menu items (a select's or a combobox's chosen item,
// a menu's checkbox and radio items), shared by the libraries: a single
// selection's check glides to the chosen item; a multiple selection's draws
// itself when the item is checked and erases itself when it's unchecked, like
// a checkbox's check (internal/controls/indicator).
//
// Choosing an item can close the list or the menu: when a check is there to
// glide (or draws or erases itself), it holds still for PICK_HOLD first, so
// the check is seen before it fades out. Each shown single selection's check
// registers with its list (CheckRegistryContext) so the list knows.

/**
 * A multiple selection's check drawing itself, like a checkbox's: its stroke
 * and opacity from 0 in 0.3s on `ease.draw`, at once (no box to fill first).
 */
const CHECK_TRANSITION: Transition = {
  ...motionTokens.transition.check,
  delay: 0,
};

/** Unchecked, it erases itself, as slowly as it draws. */
const UNCHECK_TRANSITION: Transition = motionTokens.transition.uncheck;

type DrawnCheckProps = Omit<
  IndicatorContentProps,
  'kind' | 'checked' | 'transition' | 'exitTransition'
> & {
  checked: boolean;
  /** Replaces both directions' transition. */
  transition?: Transition;
};

/**
 * A multiple selection's check, kept mounted: its content (the icon's SVG
 * shapes) draws itself in when checked (or when the list opens) and erases
 * itself when unchecked. Under reduced motion, it only fades.
 */
function DrawnCheck({ transition, ...props }: DrawnCheckProps) {
  return (
    // Out of the list's or the menu's presence: it doesn't erase itself as
    // they leave.
    <PresenceContext value={null}>
      <IndicatorContent
        {...props}
        kind="check"
        transition={transition ?? CHECK_TRANSITION}
        exitTransition={transition ?? UNCHECK_TRANSITION}
      />
    </PresenceContext>
  );
}

/**
 * A ref for a check's element: transforms (its glide) don't apply to
 * an inline box, and an indicator is often a plain `<span>` inside the
 * positioned one. Alone in it, it becomes a block, which lays out the same (an
 * inline-level box would sit 2-4px off, on the line's baseline); beside text,
 * an inline block, which keeps its line.
 */
function asTransformable(node: HTMLElement | null) {
  if (!node || getComputedStyle(node).display !== 'inline') return;
  const alone = node.parentElement?.childNodes.length === 1;
  node.style.setProperty('display', alone ? 'block' : 'inline-block');
}

/**
 * A single selection's check gliding to the chosen item: the highlight's
 * spring, so it lands with the highlight, in ~150ms without overshoot.
 */
const GLIDE_TRANSITION = motionTokens.spring.highlight;

/**
 * How long (seconds) a list holds still after an item was chosen, before it
 * closes: the check's glide, in sight.
 */
const PICK_HOLD = 0.15;

type RegisterCheck = () => () => void;

/** The list's registry of shown single-selection checks. */
const CheckRegistryContext = React.createContext<RegisterCheck | null>(null);

/** A list's registry: `hasCheck()` is read when an item is chosen. */
function useCheckRegistry() {
  const countRef = React.useRef(0);
  const registerCheck = React.useCallback<RegisterCheck>(() => {
    countRef.current += 1;
    return () => {
      countRef.current -= 1;
    };
  }, []);
  const hasCheck = React.useCallback(() => countRef.current > 0, []);
  return { registerCheck, hasCheck };
}

/** Registers a shown single-selection check with its list, while `shown`. */
function useRegisterCheck(shown: boolean) {
  const register = React.use(CheckRegistryContext);
  React.useLayoutEffect(
    () => (shown && register ? register() : undefined),
    [shown, register],
  );
}

type Picks = {
  /**
   * An item is being chosen and its check will move (glide, or pop in or
   * out): call it right before the library closes the menu.
   */
  markPick: () => void;
  /** Whether a single selection's check is shown, to glide from. */
  hasCheck: () => boolean;
};

/** The picks of the menu or list an item is in. */
const PickContext = React.createContext<Picks | null>(null);

/**
 * A menu's picks. `wasPicked()`, read when it closes, tells whether an item
 * was just chosen (the close follows the pick, in the same event or in the
 * render it schedules).
 */
function usePicks() {
  const { registerCheck, hasCheck } = useCheckRegistry();
  const pickingRef = React.useRef(false);
  const markPick = React.useCallback(() => {
    pickingRef.current = true;
    // A pick that doesn't close it (a key that keeps it open) is forgotten
    // with its event, after React has rendered what it scheduled.
    setTimeout(() => {
      pickingRef.current = false;
    });
  }, []);
  const wasPicked = React.useCallback(() => pickingRef.current, []);
  const picks = React.useMemo(
    () => ({ markPick, hasCheck }),
    [markPick, hasCheck],
  );
  return { picks, registerCheck, wasPicked };
}

export {
  CHECK_TRANSITION,
  UNCHECK_TRANSITION,
  GLIDE_TRANSITION,
  PICK_HOLD,
  CheckRegistryContext,
  DrawnCheck,
  PickContext,
  asTransformable,
  useCheckRegistry,
  usePicks,
  useRegisterCheck,
  type DrawnCheckProps,
};
