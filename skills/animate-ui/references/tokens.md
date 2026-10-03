# Motion tokens

Animate UI ships its tokens as a registry item:

```bash
npx shadcn@latest add @animate-ui/lib-motion
```

It installs `lib/motion.tsx` (under the project's `lib` alias from `components.json`) and adds three Tailwind theme variables (`ease-out-strong`, `ease-in-out-strong`, `ease-drawer`). Every Animate UI component imports from it:

```tsx
import {
  ease,
  duration,
  spring,
  scale,
  transition,
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@/lib/motion';
```

If the project doesn't use the registry, copy these values into a single local file, `tempo` included. The module also exports `tempo` and everything grouped as `motionTokens`.

## Curves

| Token         | Value                             | Use for                                        |
| ------------- | --------------------------------- | ---------------------------------------------- |
| `ease.out`    | `cubic-bezier(0.23, 1, 0.32, 1)`  | Anything entering or exiting. The default.     |
| `ease.inOut`  | `cubic-bezier(0.77, 0, 0.175, 1)` | Something already on screen moving or morphing |
| `ease.drawer` | `cubic-bezier(0.32, 0.72, 0, 1)`  | Sheets and drawers                             |

Strong ease-out is the default. Never ease-in on an entrance. Motion's built-in `easeOut` and `easeInOut` are too weak for deliberate motion; use the tokens. Color and hover transitions in CSS can use plain `ease`.

## Tempo

`tempo` is a global pace multiplier, applied to every `duration` and `spring` token (and therefore every ready-made `transition`). The default is 1, Animate UI's pace. To speed up or slow down the whole library from one place, change the constant at the top of `lib/motion.tsx`:

```tsx
const tempo = 0.8; // crisper; 1.2 feels more relaxed
```

Curves, scales and `bounce` are not affected. CSS-driven components (Base UI Drawer and Toast) use Tailwind duration classes (`duration-500`, `data-ending-style:duration-200`, …) that `tempo` doesn't reach: adjust them separately.

## Durations (seconds, at `tempo` 1)

| Token                 | Value | Use for                                       |
| --------------------- | ----- | --------------------------------------------- |
| `duration.press`      | 0.15  | Press feedback                                |
| `duration.tooltip`    | 0.2   | Tooltips                                      |
| `duration.dropdown`   | 0.3   | Popovers, menus, selects, hover cards         |
| `duration.exit`       | 0.2   | Closing tooltips, popovers, menus             |
| `duration.fade`       | 0.25  | Swapping content in place (tab panels)        |
| `duration.disclosure` | 0.3   | Accordion and collapsible height              |
| `duration.modal`      | 0.4   | Dialog entrance                               |
| `duration.modalExit`  | 0.25  | Dialog exit                                   |
| `duration.drawer`     | 0.5   | Sheet and drawer entrance                     |
| `duration.drawerExit` | 0.3   | Sheet and drawer exit                         |

These are longer than Emil Kowalski's budgets on purpose: `ease.out` covers most of the distance in the first frames, so the response is immediate and the tail lets the motion read. Budgets per element are in `rules.md` (B2). The firm limit: nothing used dozens of times a day goes past 250ms (springs: about 0.4s visual, bounce ≤ 0.15).

## Springs

| Token            | Value                                             | Use for                                                                     |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `spring.default` | `{ type: 'spring', duration: 0.5, bounce: 0.2 }`  | Larger interruptible motion: drag, layout changes, cursor following, magnetic |
| `spring.snappy`  | `{ type: 'spring', duration: 0.4, bounce: 0.15 }` | Indicators, toggles and highlights (tab indicator, switch thumb)            |

Use the `duration`/`bounce` form only (`duration` is the visual duration). `bounce` is ignored when `stiffness` or `damping` are set, so never mix them.

## Scales

| Token         | Value                                           |
| ------------- | ----------------------------------------------- |
| `scale.enter` | 0.95 (starting scale for anything that appears) |
| `scale.press` | 0.96 (press feedback)                           |

## Ready-made transitions

`transition.press`, `transition.tooltip`, `transition.dropdown`, `transition.exit`, `transition.fade` (content swaps), `transition.disclosure`, `transition.modal`, `transition.modalExit` (all with `ease.out`), `transition.drawer`, `transition.drawerExit` (with `ease.drawer`): each pairs a duration token with its curve. `transition.instant` (`{ duration: 0 }`) is the token for a deliberately instant change.

Import the `transition` export as `motionTransition`, since components also take a `transition` prop. That prop customizes the entrance; overlays keep `transition.exit` for the exit so closing stays fast (modals and sheets let it override both, with `transition ?? motionTransition.modalExit`).

## Reduced motion

`ReducedMotionConfig` wraps a component's motion tree. It needs no app setup and keeps an app-level `<MotionConfig reducedMotion="always">`. When the OS asks for reduced motion, Motion skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity, color and filter.

It does not skip a `transform` string. Inside the wrapper, `useShouldReduceMotion()` returns `true` under reduced motion: use it to start from the resting transform.

```tsx
const reduce = useShouldReduceMotion();
const enter = reduce ? 1 : scale.enter;
initial={{ opacity: 0, transform: `scale(${enter})` }}
```

Stop JavaScript-driven loops (`requestAnimationFrame`, canvas, `setInterval`) with the same hook.

## Icons

Animated icons take a `speed` prop that multiplies their playback rate. Icons default to 1.25; set it per icon (`<Bell speed={1} />`) or for a group on a wrapping `<AnimateIcon speed={…}>`. Icon timing sits in the icons/effects budget (300 to 800ms, bounce up to 0.3).
