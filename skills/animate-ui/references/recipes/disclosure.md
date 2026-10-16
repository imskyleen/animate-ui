# Disclosure (Accordion, Collapsible)

Imports and base-library wiring: [README.md](README.md).

Purpose: continuity, the content below doesn't jump. This is where `height` animates.

```tsx
const collapsed = { height: 0, opacity: 0, filter: blur.disclosure };
const expanded = {
  height: 'auto',
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' }, // no filter left at rest
};

<AnimatePresence>
  {isOpen && (
    <AccordionPrimitive.Content asChild forceMount>
      <motion.div
        initial={collapsed}
        animate={expanded}
        exit={collapsed}
        transition={useTempoTransition(
          transition ?? motionTransition.disclosure,
        )}
        style={{ overflow: 'hidden' }}
      />
    </AccordionPrimitive.Content>
  )}
</AnimatePresence>;
```

- The height grows from 0 while the content fades in from `blur.disclosure` (2px), in `transition.disclosure` (350ms, `ease.soft`), both ways. The soft ease-out lets the eye follow the content open, where `ease.out` would snap it open.
- The panel clips its content at its bottom edge, right where the next item (its border) starts: fade that edge while it moves, with a mask over 16px or over the part still hidden (`max(100% - 16px, 200% - contentHeight)`, the content's height measured when it starts moving), and drop it at rest. A hard cut there reads as the content stuck to the border.
- An item open by default unfolds on mount, page load included: no `initial={false}`.
- Reduced motion: the height jumps; the fade and the blur still play.
- Derive each item's open state from the root value; never copy it into state with an effect. With a single-value root the value is a string, so compare with `===`, not `includes` (`'item-10'.includes('item-1')` is true).
- Chevron: it turns 180° with the panel, on its timing (`transition-transform duration-350 ease-[cubic-bezier(0.215,0.61,0.355,1)]`), so the two read as one gesture.

## CSS: a native `<details>`

Without a JavaScript runtime, a `<details>` animates its `::details-content` on `transition.disclosure`, height 0 → `auto` through `interpolate-size: allow-keywords`, and `content-visibility` with `allow-discrete` so the content stays shown while it closes:

```css
details {
  interpolate-size: allow-keywords;
  --disclosure: 350ms cubic-bezier(0.215, 0.61, 0.355, 1); /* transition.disclosure */
}
details::details-content {
  height: 0;
  overflow: clip;
  opacity: 0;
  filter: blur(2px); /* blur.disclosure */
  transition:
    height var(--disclosure),
    opacity var(--disclosure),
    filter var(--disclosure),
    content-visibility var(--disclosure) allow-discrete;
}
details[open]::details-content {
  height: auto;
  opacity: 1;
  filter: none;
  mask-image: linear-gradient(to bottom, #000 calc(100% - 16px), transparent);
}
@media (prefers-reduced-motion: reduce) {
  details::details-content {
    transition-property: opacity, filter, content-visibility;
  }
}
```

- Its edge fade is a plain 16px mask while open: CSS can't measure the part still hidden. Give the content 16px of bottom padding so the fade falls on empty space at rest.
- Its marker turns with the opening: a native marker can't animate, so hide it (`list-style: none`, `summary::-webkit-details-marker { display: none }`) and draw the same triangle as `summary::before` (`content: '▶'`, `display: inline-block`), turning `rotate: 90deg` on `[open]` on the same timing. Under reduced motion it turns at once. A project that already draws its own chevron turns that one.
- Browsers without `::details-content` or `interpolate-size` open and close at once, still usable.
