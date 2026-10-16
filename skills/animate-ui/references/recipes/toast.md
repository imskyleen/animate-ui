# Toast (hand-built)

Imports and base-library wiring: [README.md](README.md).

Purpose: state, something arrived or went away. (Base UI's Toast: [css-driven.md](css-driven.md).)

```tsx
// Inside the list component; ReducedMotionConfig comes from the same import.
const enter = useTempoTransition(spring.toast);
const leave = useTempoTransition(motionTransition.dismiss);

<ReducedMotionConfig>
  <ol className="fixed right-4 bottom-4 flex flex-col gap-2" aria-live="polite">
    <AnimatePresence initial={false}>
      {toasts.map((toast) => (
        <motion.li
          key={toast.id}
          layout="position"
          initial={{
            opacity: 0,
            y: '100%',
            scale: scale.toast,
            filter: blur.surface,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: enter,
          }}
          exit={{
            opacity: 0,
            scale: scale.toast,
            filter: blur.surface,
            transition: leave,
          }}
          transition={enter}
          style={{ originY: 1 }}
        >
          {toast.message}
        </motion.li>
      ))}
    </AnimatePresence>
  </ol>
</ReducedMotionConfig>;
```

- In: it rises its own height (`y: '100%'`) from the edge it sits on, grows from `scale.toast` (0.96) out of `blur.surface`, on `spring.toast` (`enter`); the others make room with `layout="position"` on the same spring.
- Out: it fades and shrinks back into its blur in place, on `transition.dismiss` (`leave`), without travelling across the toasts around it; swiped away, it keeps going the way it was thrown.
- The `transition` prop is there for `layout` (the others making room); the targets carry their own.
- A toast timing out leaves like a dismissed one, on `transition.dismiss`: it's done, not interrupted.
- `initial={false}`: toasts already there when the list mounts (restored after a reload) show at rest; every toast added later plays its entrance.
- `layout` and a `transform` string don't mix: use the individual `y` and `scale` here, which `ReducedMotionConfig` drops under reduced motion (the fade and the blur stay).
- A toast at the top mirrors it: `y: '-100%'`, `originY: 0`.
- A toast is a surface: no bounce step. At **more** it rises 150% (`y: '150%'`) and a stack unfolds on hover with `stagger.stack`.
- Toasts that already carry `role="status"` keep it, and the list takes no `aria-live`.
- Key each toast by a unique id (a counter, `crypto.randomUUID()`), never `Date.now()`: two toasts in the same millisecond share a key.
