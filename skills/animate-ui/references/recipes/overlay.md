# Overlay (Popover, Tooltip, Hover Card, Preview Card)

Imports and base-library wiring: [README.md](README.md).

Purpose: spatial, it grows out of its trigger. It fades in and grows from its trigger on `spring.pop`, with a little overshoot, and leaves the same way.

```tsx
// Rendered inside ReducedMotionConfig (see ../base-libraries.md for the Portal part).
function PopoverContentMotion({
  className,
  children,
  transition,
  exitTransition,
  ...props
}: PopoverContentProps) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? spring.pop);
  const leave = useTempoTransition(exitTransition ?? transition ?? spring.pop);
  // `scale`, not a transform string: Motion writes `transform: none` once it
  // is back to 1, so a settled popup isn't the containing block of fixed
  // children.
  const hidden = { opacity: 0, scale: reduce ? 1 : scale.popover };

  return (
    // Library props, className and style on Content; motion on the child.
    <PopoverPrimitive.Content
      asChild
      forceMount
      data-slot="popover-content"
      className={className}
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{ opacity: 1, scale: 1, transition: enter }}
        exit={{ ...hidden, transition: leave }}
        style={{
          transformOrigin: 'var(--radix-popover-content-transform-origin)',
        }}
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  );
}
```

- Start by kind: tooltips from `scale.tooltip` (0.7), popovers, hover cards and preview cards from `scale.popover` (0.8). All on `spring.pop`, both ways.
- Scale only, no directional slide: the trigger-anchored origin already shows where it came from. Drop shadcn's `slide-in-from-*` and `zoom-in-*` classes.
- Tooltips warm up: once one is open, the next one shows at once (`initial={false}`, no transition) and the one it replaces is hidden at once with a `visibility: 'hidden'` style while its exit plays out unseen (a style, not a target: a leaving element keeps the targets of its last render, but its style still follows). 300ms after the last one closed, the next plays its entrance again. shadcn/ui gives each tooltip its own Provider, so the libraries' grouping (`data-state="instant-open"`, `data-instant`) never fires: track it across all tooltips in a module-level group (the open ones, a warm flag cleared 300ms after the last close, and the leaving ones to hide). React Aria does it itself (`shouldSkipAnimation`).
- `followCursor` on the Root (Animate UI's addition, as in v1; Radix Tooltip and HoverCard, Base UI Tooltip and PreviewCard): while the pointer moves over the trigger, the popup leans towards it by half its offset from the trigger's center, on a spring (stiffness 200, damping 17), on both axes or only `'x'` or `'y'`.
- Animate UI's own Tooltip (`@animate-ui/react/primitives/tooltip`) shares one popup per provider instead: moving to the next trigger glides it there with a layout animation, which reads better than closing and reopening.
- Positioned with Floating UI yourself: pass `open` to `useFloating` and mount the popup's content once `isPositioned` is true. Before that it sits at 0, 0, and a `layoutId` (or `layout`) animation would fly it in from the corner of the page.
- Open from the start (`defaultOpen`): it plays its entrance on mount, page load included.
- Everything the Content renders goes inside the `motion.div` (an Arrow too).
- shadcn's side offset classes (`data-[side=bottom]:translate-y-1`, …) can stay: Tailwind v4 applies them through the CSS `translate` property, which composes with the animated `transform`. With Tailwind v3 they would conflict; move the offset to `sideOffset`.
- Radix `Content` needs `forceMount` as well as the Portal, or it unmounts on close and the exit never plays.
- Extra movement such as following the cursor goes on the CSS `translate` property (`useMotionTemplate`), so it composes with the animated `transform`.
