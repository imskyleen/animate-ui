# From a feel to values

People describe motion with words ("snappier", "plus doux", "make it bounce"). Turn those words into values the same way every time: two dials, then the nearest token.

- **Pace**: how soon it arrives. Measured as the time to cover 90% of the way.
- **Life**: how far it goes past its rest before settling (overshoot). Zero is calm, a few percent is alive, over 10% is playful.

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

| Asked for                               | Step                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| bouncier · plus de rebond               | bounce +0.1 (a surface: dialog, sheet, popover stays at 0.3 or below; anything else 0.5 or below)                                 |
| less bouncy · moins de rebond, plus sec | bounce −0.1, down to 0                                                                                                            |
| faster · plus rapide, plus vif          | time ×0.85                                                                                                                        |
| slower · plus lent                      | time ×1.15                                                                                                                        |
| softer · plus doux                      | bounce −0.1 and, for a tween, `ease.soft` instead of `ease.out`                                                                   |
| subtler · plus discret                  | distances halved, starting scales twice as close to 1 (0.9 → 0.95), blur one step down; time unchanged                            |
| bolder · plus marqué                    | distances ×1.5, starting scales twice as far from 1 (0.95 → 0.9, never below 0.7 for a popup), add `blur.surface`; time unchanged |

"Faster" or "slower" for **everything** is `tempo` (SKILL.md, § Pace); for one component, change its own transition.

## Writing the value

A token stays a token when its role fits. When a step moves away from it, write the spring as `{ type: 'spring', visualDuration, bounce }` and pass it through `useTempoTransition()`. A token's equivalent, to start the step from (stiffness `k`, damping `d`, mass 1):

```text
visualDuration ≈ 2π / (1.2 · √k)
bounce         ≈ 1 − d / (2 · √k)
```

`spring.press` (550/30) is about `visualDuration: 0.22, bounce: 0.36`; `spring.dialog` (150/25) about `0.43, 0`.

## Words never override the rules

A feel changes the pace and the life, never the quality rules (`rules.md`): no ease-in on what enters, reduced motion still keeps fades and blurs, nothing pressed scales on hover. And the frequency gate still holds: "make the menu bouncy" bounces its checks and the press, while the menu itself stays short, since it opens all day.

## CSS without a JavaScript runtime

For a stylesheet, a Tailwind arbitrary value or a server component, print the CSS of a token or of a spring written as above, from the project's folder:

```bash
node <skill>/scripts/css-timing.mjs spring.press
node <skill>/scripts/css-timing.mjs transition.menu --property opacity
node <skill>/scripts/css-timing.mjs '{"type":"spring","visualDuration":0.4,"bounce":0.3}' --tempo 1.15
```

It prints the duration, the easing (a spring becomes the `linear()` curve it plays) and a ready `transition` line. In code, `toCssTiming(transition)` from `@animate-ui/react/utils/motion` returns the same `{ duration, easing }`. Put the curve in a CSS variable when several rules share it, and keep the reduced-motion rule beside it (`@media (prefers-reduced-motion: reduce)`: travel zeroed, fades kept).
