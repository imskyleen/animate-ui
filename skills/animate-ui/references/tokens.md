# Motion tokens

Every value Animate UI animates with lives in one module, one token per motion role. Two components that do the same thing use the same token; a component with its own character (a magnetic button, a tilt card) keeps its own spring.

```tsx
import {
  ease,
  spring,
  transition,
  scale,
  blur,
  useMotionTokens, // the same tokens, paced by AnimateUIProvider's tempo
  useTempoTransition,
  toCssTiming,
  ReducedMotionConfig,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
```

The static exports are the values at tempo 1. Inside a component, either read them from `useMotionTokens()` or pass the one you use through `useTempoTransition()`: both follow `<AnimateUIProvider tempo>`.

```tsx
const { spring } = useMotionTokens();
const pop = useTempoTransition(transitionProp ?? spring.pop); // same thing, with a prop
```

Import `transition` as `motionTransition` when the component also takes a `transition` prop.

## Springs

Springs first: nearly everything moves on a spring. They retarget with their velocity when interrupted, and a little overshoot makes motion feel alive. Animate UI's springs are `stiffness` / `damping` pairs (mass 1): tune those, not `bounce`, which Motion ignores when stiffness or damping are set.

| Token              | Value                                                     | Feel                                               | Use for                                                                |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `spring.press`     | `stiffness: 550, damping: 30, restSpeed: 10`              | Quick: there in ~120ms                             | Press feedback (Motion's own spring for `scale`)                       |
| `spring.pop`       | `stiffness: 300, damping: 25`                             | There in ~200ms, overshoots ~4%, settled by ~500ms | Tooltips, popovers, hover cards, anchored toasts, tags                 |
| `spring.dialog`    | `stiffness: 150, damping: 25`                             | Calm, no overshoot, ~450ms                         | Dialogs and alert dialogs                                              |
| `spring.sheet`     | `stiffness: 150, damping: 22`                             | A touch livelier, ~550ms                           | Sheets, drawers, toasts entering from an edge (they travel farther)    |
| `spring.selection` | `stiffness: 200, damping: 25`                             | Smooth slide                                       | A selection moving between items (tabs, toggle groups)                 |
| `spring.highlight` | `stiffness: 350, damping: 35`                             | Quick, never trails the pointer                    | A surface following the pointer (menu items, Highlight, nav indicator) |
| `spring.height`    | `stiffness: 300, damping: 30, bounce: 0, restDelta: 0.01` | No overshoot                                       | A height following its content (Auto Height, tab panels)               |
| `spring.thumb`     | `stiffness: 300, damping: 25`                             | Like `pop`                                         | A switch or slider thumb gliding and stretching                        |
| `spring.bounce`    | `stiffness: 200, damping: 16`                             | Bouncy                                             | Small marks popping inside a control (radio dot, typed OTP characters) |
| `spring.entrance`  | `stiffness: 200, damping: 20`                             | Playful                                            | Effects bringing content in (Fade, Slide, Zoom, Blur)                  |
| `spring.progress`  | `stiffness: 100, damping: 30`                             | Unhurried, no overshoot                            | A progress bar and its value                                           |
| `spring.number`    | `stiffness: 90, damping: 50`                              | Rolls without overshooting                         | Numbers rolling to their value                                         |

Every spring above has `type: 'spring'`.

## Tweens

Tweens are for fades, menus (opened all day long, so short and exact), disclosure heights and swaps.

| Token                   | Value                                            | Use for                                                        |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `transition.menu`       | `{ duration: 0.2, ease: ease.out }`              | Menus, selects, comboboxes, navigation menus                   |
| `transition.overlay`    | `{ duration: 0.4, ease: ease.soft }`             | An overlay fading in (the page behind blurring from 0) and out |
| `transition.fade`       | `{ duration: 0.2, ease: ease.out }`              | Content fading in place (a toast behind the front one)         |
| `transition.disclosure` | `{ duration: 0.4, ease: ease.soft }`             | Accordion and collapsible panels unfolding                     |
| `transition.panel`      | `{ duration: 0.5, ease: ease.out }`              | A panel coming in from a blur (tab panels)                     |
| `transition.check`      | `{ duration: 0.3, delay: 0.2, ease: ease.draw }` | A check drawing itself once the box has answered               |
| `transition.uncheck`    | `{ duration: 0.3, ease: ease.draw }`             | A check erasing itself                                         |
| `transition.swap`       | `{ duration: 0.2, ease: ease.out }`              | Two icons or labels swapping in place                          |
| `transition.instant`    | `{ duration: 0 }`                                | Deliberately no animation (reduced motion, a forced jump)      |

## Curves

Pick a tween's curve by what the element does:

| What it does                             | Curve                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Enters or leaves                         | `ease.out`: `cubic-bezier(0.23, 1, 0.32, 1)`                                       |
| Large surface: unfolds, or dims the page | `ease.soft`: `cubic-bezier(0.215, 0.61, 0.355, 1)`                                 |
| A mark draws itself (a checkbox's check) | `ease.draw`: `cubic-bezier(0, 0, 0.58, 1)`, Motion's `easeOut` (v1's)              |
| Moves or morphs on screen                | `ease.inOut`: `cubic-bezier(0.77, 0, 0.175, 1)`, or Motion's `easeInOut` for loops |
| Changes color (CSS)                      | `ease`                                                                             |
| Moves constantly (marquee, loader)       | `linear`                                                                           |

`ease.out` starts fast, so the interface answers on the first frame, and does most of the movement in the first third. `ease.soft` starts softer, for large surfaces the eye watches change: an accordion or collapsible pushing the page should be seen opening rather than snap open (after Motion's accordion example), and an overlay should dim the page, not cut to dark. Never ease-in on UI: it starts slow, exactly when the user is watching.

## Scales

| Token           | Value | Use for                                                                                |
| --------------- | ----- | -------------------------------------------------------------------------------------- |
| `scale.press`   | 0.95  | Anything pressed (buttons, radio, toggles; not the checkbox). Nothing scales on hover. |
| `scale.tooltip` | 0.7   | Where tooltips (and anchored toasts) grow from                                         |
| `scale.popover` | 0.8   | Where popovers, hover cards and preview cards grow from                                |
| `scale.menu`    | 0.9   | Where menus, selects and navigation menus grow from                                    |
| `scale.dialog`  | 0.8   | Dialog content, with `perspective(500px) rotateX(-20deg)`                              |
| `scale.icon`    | 0.5   | An icon swapping for another                                                           |

The smaller the element, the farther it starts, so its growth stays visible; the more often a large one opens, the subtler it gets. A tooltip's 0.7 is only a few pixels on a small label, a popover's 0.8 shows where it came from, a menu opened all day stays at 0.9.

## Blur

| Token             | Value       | Use for                                                                     |
| ----------------- | ----------- | --------------------------------------------------------------------------- |
| `blur.icon`       | `blur(2px)` | Icons and short labels swapping in place (copy → copied)                    |
| `blur.disclosure` | `blur(2px)` | The content of an accordion or collapsible panel, clearing as it unfolds    |
| `blur.surface`    | `blur(4px)` | Panels and surfaces coming in: tab panels, navigation menu content, dialogs |

A light blur during a swap makes two overlapping states read as one shape changing. Keep it at these values on anything large: heavy blur is expensive to paint, especially in Safari.

## Tempo

`tempo` paces every token at once: durations and delays are multiplied by it, and a stiffness/damping spring keeps its exact shape on the new time scale (stiffness / tempo², damping / tempo). Change it for an app or a subtree without touching any component:

```tsx
import { AnimateUIProvider } from '@animate-ui/react/provider';

<AnimateUIProvider tempo={0.8}>{children}</AnimateUIProvider>; // crisper; 1.2 is more relaxed
```

The provider is optional and nestable (the closest wins). `useTempoTransition(t)` applies it to one transition, `scaleTransition(t, tempo)` outside React. Curves, scales and blurs don't depend on it.

## CSS transitions

When the library drives a part with CSS (Base UI Drawer and Toast follow a swipe and a stack through CSS variables), set its timing from the same tokens. `toCssTiming(transition)` returns `{ duration, easing }` (milliseconds, a CSS timing function): a tween keeps its duration and cubic-bezier, and a spring becomes the `linear()` curve Motion itself would play.

```tsx
const enter = toCssTiming(useTempoTransition(spring.sheet));
style={{ transitionDuration: `${enter.duration}ms`, transitionTimingFunction: enter.easing }}
```

## Reduced motion

`ReducedMotionConfig` wraps a component's motion tree. It needs no app setup and keeps an app-level `<MotionConfig reducedMotion="always">`. When the OS asks for reduced motion, Motion skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity, color and filter: fades and blurs stay, movement goes.

It does not skip a `transform` string. Inside the wrapper, `useShouldReduceMotion()` returns `true` under reduced motion: start from the resting transform then.

```tsx
const reduce = useShouldReduceMotion();
initial={{ opacity: 0, transform: `scale(${reduce ? 1 : scale.popover})` }}
```

Animations that play on mount (text entrances, counters, a highlight sweep) use `<ReducedMotionConfig remount>`: the server render can't know the preference, so `remount` restarts them in the right mode once it resolves. Stop JavaScript-driven loops (`requestAnimationFrame`, canvas, `setInterval`) with the same hook.

## Icons

Animated icons take a `speed` prop that multiplies their playback rate (1 by default: their authored timing), per icon (`<Bell speed={1.5} />`) or for a group on a wrapping `<AnimateIcon speed={…}>`. Their loops move on screen, so they use ease-in-out; constant spins use linear.
