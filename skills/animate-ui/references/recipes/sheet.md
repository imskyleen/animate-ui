# Sheet (Sheet, Drawer)

Imports and base-library wiring: [README.md](README.md).

Purpose: spatial, it comes from its edge.

```tsx
const offscreen: Record<Side, string> = {
  right: 'translateX(100%)',
  left: 'translateX(-100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
};

// Inside ReducedMotionConfig, like every recipe.
const reduce = useShouldReduceMotion();
const enter = useTempoTransition(transition ?? motionTransition.sheet);
const leave = useTempoTransition(exitTransition ?? motionTransition.dismiss);

// Same transform function on both ends: Motion can't interpolate
// `translate(0, 0)` with `translateX(100%)`.
const shown =
  side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
const hidden = { opacity: 0, transform: reduce ? shown : offscreen[side] };

<motion.div
  initial={hidden}
  animate={{ opacity: 1, transform: shown, transition: enter }}
  exit={{ ...hidden, transition: leave }}
/>;
```

- It slides from its edge by its own size (percentages, never pixel offsets) while it fades, in on `transition.sheet` (0.4s on `ease.soft`, no bounce: held against the screen's edge, going past its rest would open a gap there) and out on `transition.dismiss` (`leave`), speeding off its edge. Under reduced motion it fades in place.
- The overlay comes and goes like a modal's; a panel that has none (a non-modal side panel) doesn't get one.
- A hand-built panel animates on its own open state, `AnimatePresence` around the conditional render (`../base-libraries.md`, plain markup).
- Drag to dismiss: use a library that decides dismissal on velocity (Animate UI's Radix Drawer, Base UI 1.8's Drawer with [css-driven.md](css-driven.md)). Don't reimplement it; a hand-built sheet asked to drag moves onto Animate UI's Radix Drawer (SKILL.md, C step 4).
- A drawer doesn't fade: it slides opaque. In, between snap points and back after a drag on `transition.drawer` (0.4s on `ease.drawer`: it answers at once and goes a hair past its rest, ~1%, which its bleed covers; a spring starts from rest and seems to hesitate, Vaul's curve zips in, stops, and crawls out). Closed, out on `transition.drawerOut` (0.16s on `ease.in`), seen speeding off its edge: a steady push read as a linear slide. Thrown by a swipe, it keeps the finger's speed: `linear`, over the time the rest of the way takes at that speed (Base UI's bounds: 0.2–4 px/ms, 80–360ms). Its shadow lifts off the page with it, from none off screen (`scrubShadow` in internal/modal-motion, by its position), so it doesn't ride out at full strength. Its overlay comes in and clears exactly like a dialog's, and follows the drag: a paused Web Animation from nothing to its classes' values, scrubbed by the drawer's position (`scrubBackdrop` in internal/modal-motion), never its opacity (over a background image, its opacity).
