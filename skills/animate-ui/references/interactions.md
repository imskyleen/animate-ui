# Interactions

Recipes for interactions people ask for by name ("make me a loading button", "animate my list") that aren't a component to install. Check `catalog.md` first; then start from the matching recipe here, keep the user's markup and styles, and change only what moves. The recipes' colors (`bg-white`, `neutral-*`) and sizes are placeholders: use the project's own (its theme tokens, its dark mode). The distances and scales a recipe writes by hand (an 8px rise, a 0.96 exit) are part of the recipe: keep them. Every recipe compiles as written, uses the tokens through `useTempoTransition()`, and keeps a reduced-motion path. Overlays, menus and controls built on a library are in `recipes.md`.

## Status button (loading, success, error)

Purpose: state, the action's progress shows where it was triggered. The label swaps in place through a light blur while the button resizes to it.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  scale,
  spring,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Status = 'idle' | 'loading' | 'success' | 'error';

const LABELS: Record<Status, string> = {
  idle: 'Save changes',
  loading: 'Saving…',
  success: 'Saved',
  error: 'Try again',
};

export function StatusButton({
  status,
  onClick,
}: {
  status: Status;
  onClick: () => void;
}) {
  return (
    <ReducedMotionConfig>
      <StatusButtonMotion status={status} onClick={onClick} />
    </ReducedMotionConfig>
  );
}

function StatusButtonMotion({
  status,
  onClick,
}: {
  status: Status;
  onClick: () => void;
}) {
  const reduce = useShouldReduceMotion();
  const press = useTempoTransition(spring.press);
  const resize = useTempoTransition(spring.reflow);
  const swap = useTempoTransition(transition.swap);

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      disabled={status === 'loading'}
      aria-live="polite"
      initial={{ transform: 'scale(1)' }}
      whileTap={{ transform: reduce ? 'scale(1)' : `scale(${scale.press})` }}
      transition={{ ...press, layout: resize }}
      className="inline-flex h-9 items-center gap-2 overflow-hidden rounded-md bg-neutral-900 px-4 text-sm text-white"
    >
      <span className="relative inline-flex">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: scale.action, filter: blur.icon }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              scale: scale.action,
              filter: blur.icon,
              transition: swap,
            }}
            transition={swap}
          >
            {LABELS[status]}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
```

When the button runs the action itself (`onSave: () => Promise<void>`), it owns its status:

```tsx
export function useActionStatus(action: () => Promise<unknown>, hold = 1500) {
  const [status, setStatus] = React.useState<Status>('idle');
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const run = React.useCallback(async () => {
    clearTimeout(timer.current);
    setStatus('loading');
    try {
      await action();
      setStatus('success');
      timer.current = setTimeout(() => setStatus('idle'), hold);
    } catch {
      setStatus('error');
    }
  }, [action, hold]);

  return [status, run] as const;
}

export function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [status, run] = useActionStatus(onSave);
  return <StatusButton status={status} onClick={run} />;
}
```

- The label is a Swap (recipes.md): `mode="popLayout"` lets the old one leave while the new one comes, `initial={false}` keeps the first render still. A text label swaps from `scale.action` (0.9); an icon from `scale.icon` (0.5).
- "Saved" holds about 1.5s, then goes back to idle. The hold is real time: `tempo` paces motion, not how long a message stays readable. A failure stays on "Try again" until the next click; clicking again clears a pending hold.
- What the animation needs from the classes: `inline-flex items-center overflow-hidden` on the button. The height, padding and colors are the user's.
- `layout` resizes the button to its label on `spring.reflow`; the press stays on `spring.press` (the `layout` key of the transition only drives the resize).
- `aria-live="polite"` reads the new label; disable the button while loading so a second click can't fire.
- "Show it's loading" is the label; add a spinner only when the project has one (an icon set, a Spinner component). It spins with CSS (`motion-safe:animate-spin`): under reduced motion it stops, the label still says it's loading.
- Copying text or toggling a like has a catalog item (Copy Button, Icon Button): use those.

## A list: items in, out, and the gap closing

Purpose: continuity, the list stays the same list while it changes.

```tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; label: string };

export function AnimatedList({
  items,
  onRemove,
}: {
  items: Item[];
  onRemove: (id: string) => void;
}) {
  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  return (
    <ReducedMotionConfig>
      <ul className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...move, opacity: fade },
              }}
              exit={{ opacity: 0, scale: 0.96, transition: fade }}
              transition={move}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              {item.label}
              <button type="button" onClick={() => onRemove(item.id)}>
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}
```

- An added item fades in and rises 8px at once, wherever it lands. The items already there on first render show at rest (`initial={false}`); a page's first entrance is Effects with `holdDelay` (catalog), not this list.
- A removed item fades and shrinks to 0.96 in place, and `mode="popLayout"` takes it out of the flow at once so the others close the gap on `spring.reflow` (`layout="position"`: they move, they don't stretch).
- Results of a search or filter don't cascade (the Palette recipe): only items added one by one animate in.
- Spacing between items is `gap`, never `space-y-*` or margins: the item `popLayout` takes out of the flow would jump by its margin. Swapping the user's `space-y-*` for `flex flex-col gap-*` of the same size is part of the recipe; say so in the output.
- Under reduced motion, `ReducedMotionConfig` drops the rise and the layout moves; the fades stay.

## A list reordered by drag

Purpose: spatial, the dragged item and the others make room as it moves.

```tsx
'use client';

import { Reorder } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function ReorderList({
  items,
  onReorder,
}: {
  items: string[];
  onReorder: (items: string[]) => void;
}) {
  const move = useTempoTransition(spring.reflow);

  return (
    <ReducedMotionConfig>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onReorder}
        className="flex flex-col gap-2"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            transition={move}
            whileDrag={{ boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)', zIndex: 1 }}
            className="relative cursor-grab rounded-lg border bg-white px-3 py-2 active:cursor-grabbing"
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </ReducedMotionConfig>
  );
}
```

- Motion's `Reorder` swaps the order as the item passes its neighbours; the others slide on `spring.reflow`.
- The dragged item lifts with a shadow, never a scale on hover; raise its `zIndex` so it passes over the others.
- Give the keyboard a way too (move up / move down buttons, or arrow keys on a focused item): the same `layout` animates those changes.
- Under reduced motion the item still follows the pointer (it's direct manipulation); the others jump to their places.

## A card that opens into a larger view

Purpose: continuity, the card becomes the view: same image, same title, now larger. Also for a gallery opening an image.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Card = { id: string; title: string; body: string; image: string };

export function ExpandingCards({ cards }: { cards: Card[] }) {
  const [open, setOpen] = React.useState<Card | null>(null);
  const morph = useTempoTransition(spring.dialog);
  const overlay = useTempoTransition(transition.overlay);
  const reveal = useTempoTransition(transition.reveal);
  const swap = useTempoTransition(transition.swap);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <ReducedMotionConfig>
      <ul className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <motion.li
            key={card.id}
            layoutId={`card-${card.id}`}
            transition={morph}
            className="overflow-hidden rounded-2xl border bg-white"
          >
            <button
              type="button"
              onClick={() => setOpen(card)}
              className="w-full text-left"
            >
              <motion.img
                layoutId={`image-${card.id}`}
                transition={morph}
                src={card.image}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <motion.h3
                layoutId={`title-${card.id}`}
                transition={morph}
                className="p-4 font-medium"
              >
                {card.title}
              </motion.h3>
            </button>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: overlay }}
            exit={{ opacity: 0, transition: overlay }}
            onClick={() => setOpen(null)}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            layoutId={`card-${open.id}`}
            transition={morph}
            className="fixed inset-x-0 top-16 z-50 mx-auto w-[min(640px,90vw)] overflow-hidden rounded-2xl border bg-white"
          >
            <motion.img
              layoutId={`image-${open.id}`}
              transition={morph}
              src={open.image}
              alt=""
              className="aspect-video w-full object-cover"
            />
            <motion.h3
              layoutId={`title-${open.id}`}
              transition={morph}
              className="p-4 text-xl font-medium"
            >
              {open.title}
            </motion.h3>
            <motion.p
              className="px-4 pb-6 text-neutral-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: reveal }}
              exit={{ opacity: 0, transition: swap }}
            >
              {open.body}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ReducedMotionConfig>
  );
}
```

- `layoutId` pairs each part with its larger self (card ↔ panel, image ↔ image, title ↔ title): Motion morphs between them on `spring.dialog`, calm, without overshoot.
- Content that only exists in the large view (the body) fades in on `transition.reveal` after the frame moved, and leaves on `transition.swap` (150ms) so it doesn't stretch with the closing frame.
- The page dims on `transition.overlay`; Escape and a click outside close it. For a real dialog (focus trap, return focus), wrap the panel in a library Dialog and keep the `layoutId` on its content.
- The card and the panel share their background, border and radius: the panel is the card grown, so a card without a background gets the panel's (the project's surface color), or the box pops in mid-morph. Overlay and panel sit above the page (`z-50`, the panel after the overlay), above the grid's moving cards.
- Images keep their aspect ratio in both states (`aspect-video` + `object-cover` on both), or the morph distorts them.
- Under reduced motion, the layout morph is skipped: the view appears and fades its body in.

## Skeleton, then content

Purpose: state, the content replaces its placeholder in place.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function Loaded({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const fade = useTempoTransition(transition.fade);
  const reveal = useTempoTransition(transition.reveal);

  return (
    <ReducedMotionConfig>
      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.div
              key="skeleton"
              aria-hidden="true"
              exit={{ opacity: 0, transition: fade }}
              className="h-24 animate-pulse rounded-lg bg-neutral-200 motion-reduce:animate-none"
            />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, filter: blur.surface }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: reveal }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReducedMotionConfig>
  );
}
```

- The skeleton fades out on `transition.fade` while the content comes out of `blur.surface` on `transition.reveal`; `popLayout` overlaps them so nothing jumps between.
- The skeleton's pulse is CSS, stopped under reduced motion (`motion-reduce:animate-none`).
- When the content's height differs from the skeleton's, wrap both in Auto Height (catalog) so the space eases to it.

## A badge counting

Purpose: feedback, the number changed. The digits roll with Sliding Number (catalog); the badge bumps when the count grows.

```tsx
'use client';

import * as React from 'react';
import { useAnimate } from 'motion/react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  spring,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function CountBadge({ count }: { count: number }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useShouldReduceMotion();
  const bump = useTempoTransition(spring.bounce);
  const previous = React.useRef(count);

  React.useEffect(() => {
    const grew = count > previous.current;
    previous.current = count;
    if (grew && !reduce) animate(scope.current, { scale: [1.15, 1] }, bump);
  }, [count, reduce, animate, scope, bump]);

  return (
    <span
      ref={scope}
      aria-label={`${count} notifications`}
      className="inline-flex min-w-5 justify-center rounded-full bg-red-500 px-1.5 text-xs text-white"
    >
      <SlidingNumber number={count} />
    </span>
  );
}
```

- Only an increase bumps (from 1.15 on `spring.bounce`); a decrease just rolls the digits.
- `aria-label` carries the count for screen readers; the rolling digits are decoration.
- Under reduced motion there's no bump, and Sliding Number shows the new value at once.

## A field in error

Purpose: feedback, this field needs attention. A short shake, the border turning red, the message read out.

```tsx
'use client';

import * as React from 'react';
import { useAnimate } from 'motion/react';
import {
  shift,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function useShake<T extends HTMLElement>() {
  const [scope, animate] = useAnimate<T>();
  const reduce = useShouldReduceMotion();
  const timing = useTempoTransition(transition.shake);
  const shake = React.useCallback(() => {
    if (reduce || !scope.current) return;
    const s = shift.shake;
    animate(
      scope.current,
      { x: [0, -s, s, -0.66 * s, 0.66 * s, -0.33 * s, 0.33 * s, 0] },
      timing,
    );
  }, [reduce, animate, scope, timing]);
  return [scope, shake] as const;
}

export function EmailField({ error }: { error: string | null }) {
  const [scope, shake] = useShake<HTMLInputElement>();
  React.useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  return (
    <label className="flex flex-col gap-1">
      Email
      <input
        ref={scope}
        type="email"
        aria-invalid={Boolean(error)}
        aria-describedby="email-error"
        className="rounded-md border px-3 py-2 transition-colors aria-invalid:border-red-500"
      />
      <span id="email-error" role="alert" className="text-sm text-red-600">
        {error}
      </span>
    </label>
  );
}
```

- The shake swings `shift.shake` (3px) to each side, then two-thirds, then a third, on `transition.shake` (0.4s): small and quick, never a wobble.
- Shake once per failed submit, not on every keystroke; the color and the message carry the error, the shake only draws the eye.
- The message lives in a `role="alert"` region tied with `aria-describedby`.
- Under reduced motion, no shake: the border and the message are the error.

## A row swiped away

Purpose: spatial, the row leaves the way it was pushed.

```tsx
'use client';

import { motion, type PanInfo } from 'motion/react';
import {
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function SwipeRow({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  const back = useTempoTransition(spring.slide);
  const away = useTempoTransition(transition.dismiss);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -120 || info.velocity.x < -500) onDelete();
  };

  return (
    <motion.li
      layout="position"
      exit={{ x: '-100%', opacity: 0, transition: away }}
      className="relative overflow-hidden rounded-lg"
    >
      <div className="absolute inset-0 flex items-center justify-end bg-red-500 pr-4 text-white">
        Delete
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        dragTransition={{
          bounceStiffness: back.stiffness as number,
          bounceDamping: back.damping as number,
        }}
        onDragEnd={onDragEnd}
        className="relative flex items-center justify-between border bg-white px-3 py-3"
      >
        {label}
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-neutral-500"
        >
          Delete
        </button>
      </motion.div>
    </motion.li>
  );
}
```

- The row only drags left (`dragConstraints` and `dragElastic` 0 on the right); released past 120px or thrown fast, it's deleted, otherwise it springs back on `spring.slide` (no overshoot past its place).
- Deleted, it leaves on `transition.dismiss` (`x: '-100%'`, under an `AnimatePresence` in the list) and the rows below close the gap with `layout`.
- Swiping is never the only way: a visible Delete button (or a menu) does the same.
- Under reduced motion (inside `ReducedMotionConfig`), the drag still follows the finger and the deleted row fades instead of sliding.

## A grid filtered or sorted

Purpose: continuity, the items that stay move to their new places.

```tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; name: string };

export function FilterGrid({ items }: { items: Item[] }) {
  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  return (
    <ReducedMotionConfig>
      <ul className="grid grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: fade }}
              transition={{ ...move, opacity: fade }}
              className="rounded-xl border p-4"
            >
              {item.name}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}
```

- Staying items glide on `spring.reflow` (`layout`), new ones grow in from 0.95, removed ones shrink out on `transition.fade`; `popLayout` lets the others move at once.
- Opacity runs on its own tween (`opacity: fade`) so items don't fade on the spring.
- Long grids: animate what's on screen only; hundreds of `layout` items make every change expensive.

## Steps of a form

Purpose: spatial, going forward slides on, going back slides back. (shadcn/ui's Questionnaire: the Steps recipe, recipes.md.)

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  shift,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function FormSteps({
  step,
  direction,
  children,
}: {
  step: number;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  return (
    <ReducedMotionConfig>
      <Steps step={step} direction={direction}>
        {children}
      </Steps>
    </ReducedMotionConfig>
  );
}

function Steps({
  step,
  direction,
  children,
}: {
  step: number;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  const reduce = useShouldReduceMotion();
  const leave = useTempoTransition(transition.panelOut);
  const enter = useTempoTransition(transition.panelIn);
  const away = (sign: number) => ({
    opacity: 0,
    filter: blur.panel,
    transform: `translateX(${reduce ? 0 : sign * direction * shift.step}px)`,
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={away(1)}
        animate={{
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translateX(0px)',
          transition: enter,
        }}
        exit={{ ...away(-1), transition: leave }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- The step leaves `shift.step` (24px) toward where you're going, into `blur.panel`, on `transition.panelOut`; the next comes from the other side on `transition.panelIn`. `mode="wait"`: one step at a time.
- Pass the direction (1 forward, -1 back) so going back mirrors it.
- Move focus to the new step's first field or heading once it's in.
- Under reduced motion, no slide: the steps cross-fade through the blur.

## A banner pushing the page

Purpose: state, a message arrives and makes room for itself.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function Banner({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const unfold = useTempoTransition(transition.disclosure);

  return (
    <ReducedMotionConfig>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="banner"
            role="status"
            initial={{ height: 0, opacity: 0, filter: blur.disclosure }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: blur.disclosure }}
            transition={unfold}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 px-4 py-3 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </ReducedMotionConfig>
  );
}
```

- Height goes from 0 to `auto` on `transition.disclosure` while it fades out of `blur.disclosure`: the one place height animates, because the page below must move (rules.md, A8).
- `role="status"` reads it out; a dismissible one gets a close button and leaves the same way.
- Content whose height changes on its own (not appearing): Auto Height (catalog).
