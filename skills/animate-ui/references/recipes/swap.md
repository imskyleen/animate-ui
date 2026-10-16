# Swap (copy → copied, sun → moon, a label changing)

Imports and base-library wiring: [README.md](README.md).

Purpose: state. Two states replace each other in place, briefly overlapping: a light blur makes the overlap read as one shape changing.

```tsx
const swap = useTempoTransition(motionTransition.swap);

<span className="relative inline-flex">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={copied ? 'copied' : 'copy'}
      initial={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: swap,
      }}
      exit={{
        opacity: 0,
        scale: scale.icon,
        filter: blur.icon,
        transition: swap,
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </motion.span>
  </AnimatePresence>
</span>;
```

- `mode="popLayout"`: the old icon leaves while the new one arrives. The `relative` wrapper keeps the leaving one in place even while the button around it is scaled by its press.
- `initial={false}`: nothing animates on mount.
- `transition: swap` goes inside `animate` and `exit`, through `useTempoTransition` so the tempo reaches it.
- A text swaps without the scale: opacity and `blur.icon` only, `layout="position"` when the box around it resizes (rules B9). Words taking turns, a string changing or a number: Rotating, Morphing or Rolling Text, Sliding Number (catalog).
- A number with its unit ('$9/month') swaps as one piece, keyed on its whole text.
- Larger content (a panel, a card) uses `blur.surface` and its own recipe's transition.
