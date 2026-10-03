# Animate UI motion rules

The rules come in two families:

- **A. Quality rules** are about correctness, accessibility and performance. They are non-negotiable: breaking one is a bug, not a taste choice.
- **B. Style rules** are Animate UI's defaults for curves, durations, scale and bounce. They are customizable (props, the `tempo` multiplier, the tokens), but a component ships with them unless the user asks otherwise.

The rules come from the October 2026 audit of the Animate UI registry. The "Avoid" examples are real code that the audit flagged.

## A. Quality rules (non-negotiable)

### Accessibility

#### A1. Respect reduced motion in every component

Two pieces, always together:

- Wrap the component's motion tree in `ReducedMotionConfig`. Under reduced motion, Motion then skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity and color.
- Motion does **not** skip a `transform` string, and components animate `transform` strings (A11). Neutralize them with `useShouldReduceMotion()`, called inside the wrapper.

```tsx
// Avoid: nothing checks the OS setting
<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} />

// Do
<ReducedMotionConfig>
  <Content />
</ReducedMotionConfig>

function Content() {
  const reduce = useShouldReduceMotion();
  const enter = reduce ? 1 : scale.enter;
  return (
    <motion.div
      initial={{ opacity: 0, transform: `scale(${enter})` }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
    />
  );
}
```

CSS-driven components zero their travel under `motion-reduce:` instead (CSS-driven recipe). Reduced motion means gentler, not none: the element still fades. JavaScript loops (canvas, `requestAnimationFrame`, `setInterval`) are not covered by Motion: stop them when `useShouldReduceMotion()` is true.

#### A2. Nothing animates on keyboard-driven or very high-frequency actions

- Global keyboard shortcuts (command palette toggle, app hotkeys) and keyboard navigation (arrow keys moving a highlight, keyboard tab selection) are instant: `transition.instant`. Only pointer interactions animate the highlight.
- Anything used 100+ times a day is instant whatever the input. Motion on it stops being information and becomes a wait.
- Opening an overlay animates the same way whatever the input; don't track input modality for it.

#### A3. Hover effects only on hover-capable pointers

Touch browsers fire `mouseenter` on tap and never fire `mouseleave`, so the hover state sticks. Motion's `whileHover` already ignores touch, and so do hover-driven library components (Radix Tooltip and Hover Card, Base UI Tooltip and Preview Card): don't add a gate to those. Gate hand-wired hover.

```tsx
// Avoid
onMouseEnter={() => setActive(value)}

// Do
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
onMouseEnter={canHover ? () => setActive(value) : undefined}
```

In CSS: `@media (hover: hover) and (pointer: fine) { … }`.

#### A4. Loops pause when nobody can see them

Infinite animations and canvas backgrounds pause off screen (`useInView`), in a hidden tab (`document.visibilityState`) and under reduced motion.

#### A5. No delay on feedback

Feedback starts on the frame of the interaction. A checkbox that waits 200ms before drawing its check feels broken. Duration is a style choice; a delay before feedback is not.

#### A6. Warm tooltips appear instantly

After the first tooltip in a group opens, moving to the next one shows it without animation. Radix marks this with `data-state="instant-open"`, Base UI with `data-instant`.

### Physicality

#### A7. Never scale from 0

Nothing appears from nothing. Start at `scale.enter` (0.95) with `opacity: 0`.

```tsx
// Avoid
initial={{ opacity: 0, scale: 0.5 }}
initial={{ opacity: 0, scale: 0 }}

// Do
initial={{ opacity: 0, transform: `scale(${scale.enter})` }}
```

Particle bursts and ripples are the only exception.

#### A8. Anchored overlays grow from their trigger

Popovers, tooltips, menus, hover cards and selects set `transform-origin` from the base library, inside the primitive. Modals are the exception: they stay centered.

| Library     | Origin                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Radix UI    | `var(--radix-<component>-content-transform-origin)` (e.g. `--radix-popover-content-transform-origin`) |
| Base UI     | `var(--transform-origin)`                                                                             |
| Headless UI | map `data-anchor` (`bottom_start` → `origin-top-left`, …)                                             |

#### A9. Exits are faster than entrances

Closing is the system's response to the user: it never takes longer than opening. Overlays close with `transition.exit`, modals with `transition.modalExit`, sheets with `transition.drawerExit`. Put each transition inside its own target (`animate` / `exit`) so they differ.

### Performance

#### A10. Animate transform and opacity, not layout

```tsx
// Avoid: layout on every frame
animate={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}

// Do: a shared element
<motion.div layoutId="highlight" transition={spring.default} />
```

Disclosures are the only place a height animation is allowed, with the technique in `recipes.md`.

#### A11. Full transform strings

Motion's `x`, `y` and `scale` shorthands run on the main thread. Write the transform on the animated element.

```tsx
// Avoid
animate={{ x: '100%' }}

// Do
animate={{ transform: 'translateX(100%)' }}
```

#### A12. Pointer and scroll values never go through React state

Drive them with motion values (`useMotionValue`, `useScroll`, `useSpring`) so nothing re-renders.

```tsx
// Avoid
onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
```

#### A13. Name the properties you transition

Never `transition: all` / `transition-all`. List them: `transition-[opacity,transform]`, `transition-colors`.

### Behavior

#### A14. Interruptible by default

Re-triggering retargets from the current value; it never restarts. Use springs or tweens that retarget. Avoid keyframe arrays with a fixed first value on anything that can be re-triggered (hover, toggle), and avoid `AnimatePresence mode="wait"` on fast swaps: it plays the exit and the entrance back to back.

#### A15. Springs use the `duration`/`bounce` form

`bounce` is ignored when `stiffness` or `damping` are set, and hand-typed physics hides the real settle time. Use the `spring` tokens or `{ type: 'spring', duration, bounce }`.

## B. Style rules (Animate UI defaults, customizable)

Animate UI deliberately runs longer than Emil Kowalski's budgets (see NOTICE.md). The strong ease-out front-loads the motion: most of the distance is covered in the first frames, so the UI responds immediately, and the longer tail lets the motion read instead of flashing by. The one firm style limit: **nothing slow on things used dozens of times a day.**

### B1. Strong ease-out is the default curve

- `ease.out` (`cubic-bezier(0.23, 1, 0.32, 1)`) for anything entering or exiting.
- `ease.inOut` only for something already on screen moving or morphing.
- `ease.drawer` for sheets and drawers.
- Never ease-in on an entrance. Motion's built-in `easeOut`/`easeInOut` are too weak; use the tokens.

```tsx
// Avoid
transition={{ duration: 0.2, ease: 'easeInOut' }}

// Do
transition={transition.dropdown} // 0.3s, ease.out
```

### B2. Duration budgets

| Element                                                                    | Budget                                                   | Default token                                     |
| -------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Used constantly: tooltip, press, tabs indicator, highlight, toggles        | up to 250ms; springs up to ~0.4s visual, bounce ≤ 0.15   | `press` 0.15s, `tooltip` 0.2s, `spring.snappy`    |
| Content swap (tab panels fade)                                             | ~250ms                                                   | `fade` 0.25s                                      |
| Disclosure height (accordion, collapsible)                                 | ~300ms                                                   | `disclosure` 0.3s                                 |
| Occasional overlays: popover, dropdown/menu, select, hover card            | 200 to 400ms                                             | `dropdown` 0.3s in, `exit` 0.2s out               |
| Modals, sheets, drawers                                                    | 300 to 600ms                                             | `modal` 0.4s / `modalExit` 0.25s, `drawer` 0.5s / `drawerExit` 0.3s |
| Icons, effects, text, delight moments                                      | 300 to 800ms, bounce up to 0.3                           | `spring.default` (0.5s, bounce 0.2)               |

A spring's real duration is its settle time: with the `duration`/`bounce` form, `duration` is the visual duration and the overshoot settles after it. Budget the visual duration.

### B3. Subtle scale

Enter from `scale.enter` (0.95). Press feedback: `scale.press` (0.96) over `transition.press`. No hover scale-up on small controls (checkbox, radio, switch).

```tsx
// Avoid
whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

// Do
whileTap={{ transform: `scale(${scale.press})`, transition: transition.press }}
```

### B4. Modals: subtle scale, centered

`scale.enter` and opacity, `transition.modal` in and `transition.modalExit` out. A 3D flip or a large scale is an opt-in variant, never the default.

### B5. Restrained defaults, expressive opt-ins

Defaults are sober: slide 8 to 16px, zoom from 0.95, bounce only where B2 allows it. Bigger effects (100px slides, flips, long wipes) are props the user asks for.

### B6. One token set

Curves, durations and springs come from `lib/motion`. Two components that do the same thing use the same token. To change the pace of everything, change `tempo` (`tokens.md`), not individual components.

## Checklist

Quality (any miss is a bug):

- [ ] Passed the gate: frequency tier and purpose named; nothing animates on keyboard-driven or 100+/day actions
- [ ] Wrapped in `ReducedMotionConfig`; `transform` strings neutralized with `useShouldReduceMotion()` (CSS: travel zeroed under `motion-reduce:`); loops stop under reduced motion
- [ ] No `scale(0)`
- [ ] Anchored overlays set `transform-origin` in the primitive; modals stay centered
- [ ] Exit faster than enter
- [ ] Only `transform` and `opacity` animate (disclosure height excepted); full `transform` strings, no `x`/`y`/`scale` shorthands
- [ ] Hover gated to hover-capable pointers; no delay on feedback; warm tooltips skip the entrance
- [ ] No `transition-all`; no hand-typed `stiffness`/`damping`
- [ ] Re-triggering retargets instead of restarting
- [ ] Same exports, props and `data-slot` as the original component

Style (defaults; deviations named in the output):

- [ ] `ease.out` on enter and exit (`ease.inOut` only for on-screen movement)
- [ ] Durations from the tokens and within the B2 budget; nothing slow on things used dozens of times a day
- [ ] Enters from `scale.enter` (0.95); press at `scale.press` (0.96); bounce within budget
