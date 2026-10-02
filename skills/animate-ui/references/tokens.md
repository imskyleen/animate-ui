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

If the project doesn't use the registry, copy these values into a single local file.

## Curves

| Token         | Value                             | Use for                                        |
| ------------- | --------------------------------- | ---------------------------------------------- |
| `ease.out`    | `cubic-bezier(0.23, 1, 0.32, 1)`  | Anything entering or exiting. The default.     |
| `ease.inOut`  | `cubic-bezier(0.77, 0, 0.175, 1)` | Something already on screen moving or morphing |
| `ease.drawer` | `cubic-bezier(0.32, 0.72, 0, 1)`  | Sheets and drawers                             |

Never `easeIn` on UI. Motion's built-in `easeOut` and `easeInOut` are too weak for deliberate motion; use the tokens. Color and hover transitions in CSS can use plain `ease`.

## Durations (seconds)

| Token                | Value | Use for                             |
| -------------------- | ----- | ----------------------------------- |
| `duration.press`     | 0.12  | Press feedback                      |
| `duration.tooltip`   | 0.15  | Tooltips, small popovers            |
| `duration.dropdown`  | 0.2   | Dropdowns, menus, selects, popovers |
| `duration.exit`      | 0.15  | Closing tooltips, popovers, menus   |
| `duration.modal`     | 0.3   | Dialog entrance                     |
| `duration.modalExit` | 0.2   | Dialog exit                         |

UI motion stays under 0.3s. Only marketing or explanatory motion goes longer.

## Springs

| Token            | Value                                            | Use for                                                           |
| ---------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `spring.default` | `{ type: 'spring', duration: 0.5, bounce: 0.2 }` | Interruptible dynamic UI: moving indicators, layout changes, drag |
| `spring.snappy`  | `{ type: 'spring', duration: 0.3, bounce: 0 }`   | Controls used many times a day (switch thumb, toggle)             |

Use the `duration`/`bounce` form only. `bounce` is ignored when `stiffness` or `damping` are set, so never mix them.

## Scales

| Token         | Value                                           |
| ------------- | ----------------------------------------------- |
| `scale.enter` | 0.96 (starting scale for anything that appears) |
| `scale.press` | 0.97 (press feedback)                           |

## Ready-made transitions

`transition.press`, `transition.tooltip`, `transition.dropdown`, `transition.exit`, `transition.disclosure`, `transition.modal`, `transition.modalExit`, `transition.drawer`: each pairs a duration with its curve. `transition.instant` (`{ duration: 0 }`) is the token for a deliberately instant change.

Import the `transition` export as `motionTransition`, since components also take a `transition` prop.

## Reduced motion

`ReducedMotionConfig` wraps a component's motion tree. It needs no app setup and keeps an app-level `<MotionConfig reducedMotion="always">`. When the OS asks for reduced motion, Motion skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity, color and filter.

It does not skip a `transform` string. Inside the wrapper, `useShouldReduceMotion()` returns `true` under reduced motion: use it to start from the resting transform.

```tsx
const reduce = useShouldReduceMotion();
const enter = reduce ? 1 : scale.enter;
initial={{ opacity: 0, transform: `scale(${enter})` }}
```

Stop JavaScript-driven loops (`requestAnimationFrame`, canvas, `setInterval`) with the same hook.
