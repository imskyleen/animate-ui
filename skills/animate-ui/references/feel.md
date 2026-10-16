# From a feel to values

People describe motion with words ("snappier", "plus doux", "make it bounce"). Turn those words into values the same way every time: two dials, then the nearest token.

- **Pace**: how soon it arrives. Measured as the time to cover 90% of the way.
- **Life**: how far it goes past its rest before settling (overshoot). Zero is calm, a few percent is alive, over 10% is playful.

Three durations describe one spring, and they differ: the **pace** (90% of the way, what the tables give), the **`visualDuration`** (when it looks settled, about twice the pace) and the **CSS duration** `css-timing.mjs` prints (the whole curve until it rests, longer still). `spring.dialog`: 327ms pace, `visualDuration` 0.43, 750ms of CSS curve. Likewise the visible overshoot and Motion's `bounce` knob are two scales: `bounce` 0.1 → 0.2% · 0.2 → 1.5% · 0.3 → 4.6% · 0.36 → 7% · 0.4 → 9.5% · 0.5 → 16%.

## Levels

How much motion, asked before the feel when the request doesn't say (SKILL.md § 3). The gate still holds at every level: what's used all day stays short, only its rare moments grow.

| Level                          | What it does                                                                                                                                                                                                        | Example: a label changing       | Example: a list item added                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------ |
| **Subtle** (default) · discret | The role's token as it is: a fade, a light blur (`blur.icon`), small travel, no overshoot beyond the token's own. Noticeable without drawing the eye.                                                               | Fades through a 2px blur, 150ms | Fades in, rises 8px, the others close the gap                      |
| **More** · plus animé          | One step up: `blur.surface`, distances ×1.5 or a short slide where there was none, `transition.reveal` instead of `transition.swap`, bounce +0.1 on what isn't a surface.                                           | 4px blur, slides 6px, 300ms     | Rises 12px out of a 4px blur, a hint of bounce                     |
| **Expressive** · très animé    | Animate UI's expressive primitives first (Rotating, Morphing, Rolling Text, Sliding Number, Particles, Effects with a stagger), then springs with a clear bounce (`spring.bounce`) and staggers. Rare moments only. | Rolling or Morphing Text        | Pops in on `spring.bounce`, a stagger when several arrive together |

For an interaction, step its own recipe the same way: **more** adds `blur.surface` and a 6px slide to what enters, a little bounce to what settles (a reordered item, a swiped row coming back); **expressive** swaps a changing value for Sliding or Rolling Number, staggers what arrives together, and lets a dismissed row fly off with its throw.

## Words

| Asked for                                             | Life       | Pace                  | Start from                                                                |
| ----------------------------------------------------- | ---------- | --------------------- | ------------------------------------------------------------------------- |
| snappy, quick, responsive · vif, réactif, nerveux     | 2–7%       | 100–140ms             | `spring.press` (7%, 104ms), `spring.pop` (4%, 135ms)                      |
| crisp, precise, tight · net, sec, précis              | none       | ~150ms                | `spring.highlight` (151ms); a tween: `transition.menu`                    |
| smooth, fluid, silky · fluide, doux, soyeux           | under 0.5% | ~190ms                | `spring.selection` (188ms), `spring.height`                               |
| gentle, light · léger, délicat                        | none       | ~230ms                | `spring.slide` (228ms), with a shorter travel                             |
| alive, natural, organic · vivant, naturel, organique  | ~4%        | 160–190ms             | `spring.toast` (4%, 160ms), `spring.entrance` (4%, 187ms)                 |
| calm, elegant, premium · posé, élégant, haut de gamme | none       | ~330ms                | `spring.dialog` (327ms)                                                   |
| heavy, solid · lourd, massif                          | none       | 400ms+, slow to start | `{ type: 'spring', visualDuration: 0.5, bounce: 0 }`                      |
| bouncy, playful, fun · rebondi, joueur, fun           | 10–14%     | 100–160ms             | `spring.bounce` (12%, 160ms), `spring.checkPop` (14%, 98ms)               |
| elastic, cartoon · élastique, cartoon                 | 20%+       | 200ms+                | `{ type: 'spring', visualDuration: 0.5, bounce: 0.5 }`, rare moments only |
| lazy, dreamy · paresseux, rêveur                      | none       | ~1s+                  | `spring.number` (1.25s)                                                   |
| instant, no animation · instantané, sans animation    | —          | 0                     | `transition.instant`                                                      |

Fades and color changes stay tweens whatever the word: `transition.fade`, `transition.color`, `transition.reveal`. A word changes how things move, not that they fade.

## Adjusting

Each step below is one unit; asked again, take another step from where it is.

| Asked for                               | Step                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bouncier · plus de rebond               | bounce +0.1 (a surface: dialog, sheet, popover, menu, select, tooltip stays at 0.3 or below; anything else 0.5 or below). On something opened all day (a menu, a select), the bounce goes to its press and its checks; the surface keeps its token. With no press or checks to take it, the surface's own bounce steps, at its pace and capped at 0.3 |
| less bouncy · moins de rebond, plus sec | bounce −0.1, down to 0                                                                                                                                                                                                                                                                                                                                |
| faster · plus rapide, plus vif          | `visualDuration` (or a tween's duration) ×0.85                                                                                                                                                                                                                                                                                                        |
| slower · plus lent                      | `visualDuration` (or a tween's duration) ×1.15                                                                                                                                                                                                                                                                                                        |
| softer · plus doux                      | bounce −0.1 and, for a tween, `ease.soft` instead of `ease.out`                                                                                                                                                                                                                                                                                       |
| subtler · plus discret                  | distances halved, starting scales twice as close to 1 (0.9 → 0.95), blur one step down; time unchanged                                                                                                                                                                                                                                                |
| bolder · plus marqué                    | a changing text: one level up (rules B9); otherwise distances ×1.5, starting scales twice as far from 1 (0.95 → 0.9, never below 0.7 for a popup), add `blur.surface`; time unchanged                                                                                                                                                                 |

A playful press may also go one scale deeper (a card's 0.985 → 0.97): a big bounce on a 1.5% press barely shows. A word about leaving ("leave quickly") changes the surface's exit, not its overlay, which still clears like it came. A dialog's or a sheet's exit (`transition.dismiss`) is already quick: keep it, and step it (×0.85) only when asked again.

"Faster" or "slower" for **everything** is `tempo` (SKILL.md, § Pace); for one component, change its own transition.

## Writing the value

A token stays a token when its role fits. Start a step from the token's exact equivalent and keep its `visualDuration`; the exit stays as it is. When a step moves away from it, write the spring as `{ type: 'spring', visualDuration, bounce }` and pass it through `useTempoTransition()`. A token's equivalent, to start the step from (stiffness `k`, damping `d`, mass 1):

```text
visualDuration ≈ 2π / (1.2 · √k)
bounce         ≈ 1 − d / (2 · √k)
```

`spring.press` (550/30) is about `visualDuration: 0.22, bounce: 0.36`; `spring.dialog` (150/25) about `0.43, 0`.

## Words never override the rules

A feel changes the pace and the life inside the frequency gate (SKILL.md), never the quality rules (`rules.md`): no ease-in on what enters, reduced motion still keeps fades and blurs, nothing pressed scales on hover. And the frequency gate still holds: "make the menu bouncy" bounces its checks and the press, while the menu itself stays short, since it opens all day.

## CSS without a JavaScript runtime

For a stylesheet, a Tailwind arbitrary value or a server component, print the CSS of a token or of a spring written as above, from the project's folder:

```bash
node <skill>/scripts/css-timing.mjs spring.press
node <skill>/scripts/css-timing.mjs transition.menu --property opacity
node <skill>/scripts/css-timing.mjs '{"type":"spring","visualDuration":0.4,"bounce":0.3}' --tempo 1.15
```

It prints the duration, the easing (a spring becomes the `linear()` curve it plays) and a ready `transition` line. In code, `toCssTiming(transition)` from `@animate-ui/react/utils/motion` returns the same `{ duration, easing }`. Put the curve in a CSS variable when several rules share it, and keep the reduced-motion rule beside it (`@media (prefers-reduced-motion: reduce)`: travel zeroed, fades kept).

An element toggled with `display: none` animates both ways with `@starting-style` and `transition-behavior: allow-discrete`: the open rule carries the entrance, the closed rule the exit (an exiting element takes the closed rule's transition), and `display` transitions for as long as the longest of them: in the open rule that's the entrance's longest, in the closed rule the exit's.

```css
:root {
  --dialog-in: 750ms linear(0, 0.0071, …, 1); /* css-timing.mjs spring.dialog */
  --dialog-out: 200ms cubic-bezier(…); /* css-timing.mjs transition.dismiss */
  --dialog-from: perspective(500px) rotateX(-20deg) scale(0.8);
}
@media (prefers-reduced-motion: reduce) {
  :root {
    --dialog-from: none;
  }
}
.modal {
  transition:
    transform var(--dialog-in),
    filter var(--dialog-in),
    opacity 400ms cubic-bezier(…),
    display 750ms allow-discrete;
}
@starting-style {
  .modal[data-open='true'] {
    opacity: 0;
    transform: var(--dialog-from);
    filter: blur(4px);
  }
}
.modal[data-open='false'] {
  display: none;
  opacity: 0;
  transform: var(--dialog-from);
  filter: blur(4px);
  transition:
    transform var(--dialog-out),
    filter var(--dialog-out),
    opacity var(--dialog-out),
    display 200ms allow-discrete;
}
```

The overlay brings its color in from `transparent` (never its opacity over a backdrop blur), and clears the same way:

```css
.modal-backdrop {
  transition:
    background-color var(--overlay),
    display 400ms allow-discrete;
}
@starting-style {
  .modal-backdrop[data-open='true'] {
    background-color: transparent;
  }
}
.modal-backdrop[data-open='false'] {
  display: none;
  background-color: transparent;
}
```

When the JS only adds or removes the attribute, write `[data-open]` and `:not([data-open])` instead of the values. At rest, keep the open state's own values (`transform: none`, `filter: none`): a transform or a filter left at rest makes the modal the containing block of its fixed children.

Browsers without `@starting-style` open and close at once, still usable. Check it without a browser by reading: every animated property is `transform`, `opacity`, `filter` or a color; each state's `transition` lists them by name; the closed rule carries the exit; the reduced-motion block zeroes the travel and keeps the fades.
