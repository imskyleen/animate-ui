# Modal (Dialog, Alert Dialog)

Imports and base-library wiring: [README.md](README.md).

Purpose: state, the page is now in a modal mode. Modals stay centered: no trigger origin. A popup centered with `-translate-x-1/2 -translate-y-1/2` keeps its classes under Tailwind v4 (the `translate` property composes with Motion's `transform`); under Tailwind v3 they'd fight it: center it with a flex or grid wrapper instead.

```tsx
const TIPPED = `perspective(500px) rotateX(-20deg) scale(${scale.dialog})`;
const UPRIGHT = 'perspective(500px) rotateX(0deg) scale(1)';
// Its fade: at once, ahead of its tilt and of its overlay.
const FADE = transition.dialogFade;
// Dismissed: back the way it came, at once, quicker, speeding away.
const DISMISS = transition.dismiss;

function DialogContentMotion({
  transition,
  exitTransition,
  children,
  ...props
}: DialogContentProps) {
  const reduce = useShouldReduceMotion();
  const tip = useTempoTransition(transition ?? spring.dialog);
  const fade = useTempoTransition(FADE);
  // A transition passed drives the fade too.
  const enter = transition ? tip : { ...tip, opacity: fade };
  const leave = useTempoTransition(exitTransition ?? DISMISS);
  const hidden = {
    opacity: 0,
    filter: blur.surface,
    transform: reduce ? UPRIGHT : TIPPED,
  };

  return (
    <DialogPrimitive.Content
      asChild
      forceMount
      data-slot="dialog-content"
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{
          opacity: 1,
          filter: 'blur(0px)',
          transform: UPRIGHT,
          transition: enter,
        }}
        exit={{ ...hidden, transition: leave }}
      >
        {children}
      </motion.div>
    </DialogPrimitive.Content>
  );
}
```

- The content tips forward to upright and un-blurs on `spring.dialog` (no overshoot), fading in ahead of it at once (`transition.dialogFade`, 400ms on `ease.soft`): it's there first, then it settles, readable sooner than if it faded on the spring (90% opaque at ~200ms rather than ~350ms). Dismissed, it goes back the way it came on `transition.dismiss` (0.2s on `ease.away`, a steady push from half its average speed to one and a half): at once, quicker than it came and speeding away, out of sight just before its overlay has cleared. An ease-in waited on its first frames; an ease-out crawled out. A sheet slides off its edge the same way.
- `from` (Animate UI's addition, as in v1) picks the edge it tips from: `top` by default and `right` turn it by -20deg, `bottom` and `left` by 20deg, around the X axis for top and bottom, the Y axis for left and right.
- The overlay brings its background color and backdrop filter in from nothing (`transparent` / `none`) to its classes' values, as a Web Animation (`useBackdropFade` in internal/modal-motion: any color syntax interpolates), never its opacity: with a `backdrop-blur` class, an opacity fade cross-fades the sharp page with an already blurred one, and the blur seems not to start at 0. On `transition.overlay` (400ms, `ease.soft`), with the content's fade, and the same way out. On a strong ease-out, a short overlay reads as a cut. Whatever unmounts the modal waits for the overlay to be clear.
- Drop the blur at rest if the content holds fixed-position children (`transitionEnd: { filter: 'none' }`): a `filter` makes it their containing block.
