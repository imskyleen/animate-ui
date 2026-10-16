# Palette (command palette, spotlight search)

Imports and base-library wiring: [README.md](README.md).

Purpose: spatial, but opened all day from the keyboard: the shortest form, never a wait.

- The panel fades in and grows from `scale.menu` (0.9) on `transition.menu`, from its own center (it's centered, not anchored); it leaves the same way, no slower. No tilt and no `spring.dialog`: a palette isn't a modal moment.
- The backdrop, if any, fades on the same transition, not on the modal's `transition.overlay`.
- Results never stagger, and a query changing doesn't replay any entrance: filtered items appear and disappear at once (or with `layout` on `spring.reflow` if they must move). If it has a selected result (arrow keys), its background glides with Highlight (`../catalog.md`) on `spring.highlight`; if not, don't add keyboard selection for the animation's sake.
- The backdrop fades its opacity; only one with a `backdrop-blur` brings its color and blur in instead ([modal.md](modal.md)).
- The `scale` prop, not a transform string: `ReducedMotionConfig` drops it under reduced motion and the fade stays, so no hook is needed.

```tsx
<ReducedMotionConfig>
  <AnimatePresence>
    {open && (
      <motion.div
        key="palette"
        className="fixed inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: enter }}
        exit={{ opacity: 0, transition: enter }}
        onClick={close}
      >
        <motion.div
          role="dialog"
          aria-label="Command palette"
          initial={{ opacity: 0, scale: scale.menu }}
          animate={{ opacity: 1, scale: 1, transition: enter }}
          exit={{ opacity: 0, scale: scale.menu, transition: enter }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* input and results, unanimated */}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</ReducedMotionConfig>
```

`enter` is `useTempoTransition(motionTransition.menu)`. The panel sits inside the backdrop, so both leave together: an exit plays on every animated element under the one `AnimatePresence` removes.

- Hand-built (a `div role="dialog"`): animate it as it is, with `AnimatePresence` around the conditional render; built on a library's Dialog, keep the library's Content and put the motion on its child, as the Overlay recipe does.
