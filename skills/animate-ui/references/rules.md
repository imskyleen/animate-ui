# Animate UI motion rules

Each rule comes from the October 2026 audit of the Animate UI registry. The "Avoid" examples are real code that the audit flagged.

## Accessibility

### 1. Respect reduced motion in every component

Two pieces, always together:

- Wrap the component's motion tree in `ReducedMotionConfig`. Under reduced motion, Motion then skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity and color.
- Motion does **not** skip a `transform` string, and components animate `transform` strings (rule 14). Neutralize them with `useShouldReduceMotion()`, called inside the wrapper.

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

Reduced motion means gentler, not none: the element still fades. JavaScript loops (canvas, `requestAnimationFrame`, `setInterval`) are not covered by Motion: stop them when `useShouldReduceMotion()` is true.

### 2. Hover effects only on hover-capable pointers

Touch browsers fire `mouseenter` on tap and never fire `mouseleave`, so the hover state sticks. Motion's `whileHover` already ignores touch, and so do hover-driven library components (Radix Tooltip and Hover Card, Base UI Tooltip and Preview Card): don't add a gate to those. Gate hand-wired hover.

```tsx
// Avoid
onMouseEnter={() => setActive(value)}

// Do
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
onMouseEnter={canHover ? () => setActive(value) : undefined}
```

In CSS: `@media (hover: hover) and (pointer: fine) { … }`.

### 3. Loops pause when nobody can see them

Infinite animations and canvas backgrounds pause off screen (`useInView`), in a hidden tab (`document.visibilityState`) and under reduced motion.

## Physicality

### 4. Never scale from 0

Nothing appears from nothing. Start at `scale.enter` (0.96) with `opacity: 0`.

```tsx
// Avoid
initial={{ opacity: 0, scale: 0.5 }}
initial={{ opacity: 0, scale: 0 }}

// Do
initial={{ opacity: 0, transform: `scale(${scale.enter})` }}
```

Particle bursts and ripples are the only exception.

### 5. Anchored overlays grow from their trigger

Popovers, tooltips, menus, hover cards and selects set `transform-origin` from the base library, inside the primitive. Modals are the exception: they stay centered.

| Library     | Origin                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Radix UI    | `var(--radix-<component>-content-transform-origin)` (e.g. `--radix-popover-content-transform-origin`) |
| Base UI     | `var(--transform-origin)`                                                                             |
| Headless UI | map `data-anchor` (`bottom_start` → `origin-top-left`, …)                                             |

### 6. Press feedback is subtle and fast

`scale.press` (0.97) over `transition.press`, released faster than pressed. No hover scale-up on small controls (checkbox, radio, switch).

```tsx
// Avoid
whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

// Do
whileTap={{ transform: `scale(${scale.press})`, transition: transition.press }}
```

### 7. Modals: subtle scale, faster exit

`scale(0.96)` and opacity, `transition.modal` in and `transition.modalExit` out. A 3D flip or a large scale is an opt-in variant, never the default.

## Timing

### 8. Ease-out for entering and exiting

```tsx
// Avoid
transition={{ duration: 0.2, ease: 'easeInOut' }}

// Do
transition={transition.dropdown} // 0.2s, ease.out
```

### 9. Stay inside the duration budget

| Element                         | Budget        |
| ------------------------------- | ------------- |
| Press feedback                  | 0.1 to 0.16s  |
| Tooltip                         | 0.125 to 0.2s |
| Dropdown, menu, popover, select | 0.15 to 0.25s |
| Dialog, sheet                   | 0.2 to 0.5s   |

A spring's real duration is its settle time: `{ stiffness: 300, damping: 25 }` takes about 320ms with overshoot, which is too slow for a tooltip.

### 10. No delay on feedback

Feedback starts on the frame of the interaction. A checkbox that waits 200ms before drawing its check feels broken.

### 11. Warm tooltips appear instantly

After the first tooltip in a group opens, moving to the next one shows it without animation. Radix marks this with `data-state="instant-open"`, Base UI with `data-instant`.

### 12. Nothing animates on keyboard-driven actions

Arrow-key navigation in a menu or list moves the highlight instantly. Only pointer interactions animate it.

## Performance

### 13. Animate transform and opacity only

```tsx
// Avoid: layout on every frame
animate={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}

// Do: a shared element
<motion.div layoutId="highlight" transition={spring.default} />
```

Disclosures are the only place a height animation is allowed, with the technique in `recipes.md`.

### 14. Full transform strings

Motion's `x`, `y` and `scale` shorthands run on the main thread. Write the transform on the animated element.

```tsx
// Avoid
animate={{ x: '100%' }}

// Do
animate={{ transform: 'translateX(100%)' }}
```

### 15. Pointer and scroll values never go through React state

Drive them with motion values (`useMotionValue`, `useScroll`, `useSpring`) so nothing re-renders.

```tsx
// Avoid
onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
```

### 16. Name the properties you transition

Never `transition-all`. List them: `transition-[opacity,transform]`, `transition-colors`.

## Cohesion

### 17. One token set

Curves, durations and springs come from `lib/motion`. Two components that do the same thing use the same token.

### 18. Interruptible by default

Use springs or tweens that retarget from the current value. Avoid keyframe arrays with a fixed first value on anything that can be re-triggered (hover, toggle), and avoid `AnimatePresence mode="wait"` on fast swaps: it plays the exit and the entrance back to back.

### 19. Restrained defaults, expressive opt-ins

Defaults are sober: slide 8 to 16px, zoom from 0.96. Bigger effects (100px slides, flips, long wipes) are props the user asks for.

## Checklist

- [ ] Passed the gate (frequency tier and purpose named)
- [ ] Wrapped in `ReducedMotionConfig`; `transform` strings neutralized with `useShouldReduceMotion()`; loops stop under reduced motion
- [ ] No `scale(0)`; enters from 0.96
- [ ] Anchored overlays set `transform-origin` in the primitive
- [ ] Ease-out on enter and exit; durations within budget; exit faster than enter
- [ ] Only `transform` and `opacity` animate (disclosure height excepted)
- [ ] Full `transform` strings, no `x`/`y`/`scale` shorthands
- [ ] Hover gated to hover-capable pointers; nothing animates on keyboard navigation
- [ ] No `transition-all`; no hand-typed springs
- [ ] Re-triggering retargets instead of restarting
- [ ] Same exports, props and `data-slot` as the original component
