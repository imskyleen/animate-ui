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

Curves, scales and `bounce` are not affected. CSS-driven components (Base UI Drawer and Toast) use Tailwind duration classes (`duration-600`, `data-ending-style:duration-400`, …) that `tempo` doesn't reach: adjust them separately.

## Durations (seconds, at `tempo` 1)

| Token                 | Value | Use for                                       |
| --------------------- | ----- | --------------------------------------------- |
| `duration.press`      | 0.15  | Press feedback                                |
| `duration.change`     | 0.6   | Other state changes: checkmarks, swapped icons, labels (`transition.change`) |
| `duration.tooltip`    | 0.6   | Tooltips                                      |
| `duration.dropdown`   | 0.6   | Popovers, menus, selects, hover cards         |
| `duration.exit`       | 0.4   | Closing tooltips, popovers, menus             |
| `duration.fade`       | 0.6   | Swapping content in place (tab panels)        |
| `duration.disclosure` | 0.6   | Accordion and collapsible height              |
| `duration.modal`      | 0.6   | Dialog entrance                               |
| `duration.modalExit`  | 0.4   | Dialog exit                                   |
| `duration.drawer`     | 0.6   | Sheet and drawer entrance                     |
| `duration.drawerExit` | 0.4   | Sheet and drawer exit                         |

Every entrance and state change is 0.6s, exits 0.4s (about two thirds), press 0.15s. These are longer than Emil Kowalski's budgets on purpose: `ease.out` does most of the movement in the first ~150ms, so the response is immediate and the long tail lets the motion read. Keyboard-driven and 100+/day actions stay instant (quality rule, `transition.instant`). Budgets are in `rules.md` (B2).

## Springs

| Token            | Value                                             | Use for                                                                     |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `spring.default` | `{ type: 'spring', duration: 0.6, bounce: 0.2 }`  | Larger interruptible motion: drag, layout changes, cursor following, magnetic |
| `spring.snappy`  | `{ type: 'spring', duration: 0.6, bounce: 0.15 }` | Indicators, toggles and highlights (tab indicator, switch thumb)            |

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

Animations that play on mount (text entrances, counters, a highlight sweep) use `<ReducedMotionConfig remount>`. The server render can't know the user's preference, so `useShouldReduceMotion()` is `false` during hydration: an entrance started then would keep playing once the preference resolves. `remount` remounts the children when the preference changes, so they restart in the right mode. Overlays and other components that only animate after user input don't need it.

It does not skip a `transform` string. Inside the wrapper, `useShouldReduceMotion()` returns `true` under reduced motion: use it to start from the resting transform.

```tsx
const reduce = useShouldReduceMotion();
const enter = reduce ? 1 : scale.enter;
initial={{ opacity: 0, transform: `scale(${enter})` }}
```

Stop JavaScript-driven loops (`requestAnimationFrame`, canvas, `setInterval`) with the same hook.

## Icons

Animated icons take a `speed` prop that multiplies their playback rate. Icons default to 1 (their authored timing, median about 600ms); set it per icon (`<Bell speed={1.5} />`) or for a group on a wrapping `<AnimateIcon speed={…}>`. Returning to rest takes 0.4s with `ease.out`. Bounce up to 0.3.
