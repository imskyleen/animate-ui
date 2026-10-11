# Motion tokens

Every value Animate UI animates with lives in one module, one token per motion role. Two components that do the same thing use the same token; a component with its own character (a magnetic button, a tilt card) keeps its own spring.

```tsx
import {
  ease,
  spring,
  transition,
  scale,
  blur,
  shift,
  stagger,
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

| Token              | Value                                                          | Feel                                                                                                    | Use for                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spring.press`     | `stiffness: 550, damping: 30, restSpeed: 10`                   | Quick: there in ~120ms                                                                                  | Press feedback (Motion's own spring for `scale`)                                                                                                                                                                        |
| `spring.pop`       | `stiffness: 400, damping: 29`                                  | There in ~175ms, overshoots ~4%, settled by ~440ms                                                      | Tooltips, popovers, hover cards, anchored toasts, tags                                                                                                                                                                  |
| `spring.tooltip`   | `stiffness: 400, damping: 31`                                  | As quick as `pop`, about 2% past                                                                        | Animate UI's own Tooltip: growing from its trigger and gliding between triggers                                                                                                                                         |
| `spring.dialog`    | `stiffness: 150, damping: 25`                                  | Calm, no overshoot, ~450ms                                                                              | Dialogs and alert dialogs                                                                                                                                                                                               |
| `spring.toast`     | `stiffness: 280, damping: 24`                                  | There in ~165ms, overshoots ~4% (at ~270ms), settled by ~525ms: it lands                                | Toasts rising from an edge (from `scale.toast` out of `blur.surface`), and their stack                                                                                                                                  |
| `spring.selection` | `stiffness: 300, damping: 30`                                  | Smooth slide                                                                                            | A selection moving between items (tabs, a single-selection toggle group)                                                                                                                                                |
| `spring.highlight` | `stiffness: 500, damping: 40`                                  | Quick, there in ~150ms, never trails the pointer                                                        | A surface following the pointer (menu items, Highlight, nav indicator, a toggle group's hover highlight), a list's or a menu's check gliding to the chosen item (`pop`); an OTP field's ring gliding to the active slot |
| `spring.reflow`    | `stiffness: 500, damping: 40`                                  | Quick, no overshoot                                                                                     | Items making room for one added or closing the gap of one removed (a combobox's chips and its input)                                                                                                                    |
| `spring.handoff`   | `stiffness: 450, damping: 43`                                  | From rest, there in ~230ms, no overshoot (critically damped)                                            | A menu's content sliding in as a menubar's popover is handed from one menu to the next (`shift.handoff`), like Motion's mega menu                                                                                       |
| `spring.morph`     | `stiffness: 660, damping: 52`                                  | Starts gently, half the way in ~65ms, most in ~155ms, never past (critically damped), settled by ~300ms | A popover moving and resizing from one content to the next (a menubar's handed from menu to menu, a navigation menu's), keeping its speed when it changes course (internal/momentum)                                    |
| `spring.height`    | `stiffness: 300, damping: 30, bounce: 0, restDelta: 0.01`      | No overshoot                                                                                            | A height following its content (Auto Height)                                                                                                                                                                            |
| `spring.thumb`     | `stiffness: 300, damping: 25`                                  | There in ~200ms, overshoots ~4%, settled by ~500ms                                                      | A switch thumb gliding and stretching                                                                                                                                                                                   |
| `spring.slider`    | `stiffness: 400, damping: 32`                                  | As quick, calmer: 90% of the way in ~150ms, overshoots ~1.5%, settled by ~480ms                         | A slider's thumb and range gliding to a pressed value, and its thumb stretching                                                                                                                                         |
| `spring.bounce`    | `stiffness: 200, damping: 16`                                  | Bouncy                                                                                                  | Small marks popping inside a control (radio dot)                                                                                                                                                                        |
| `spring.glyph`     | `stiffness: 500, damping: 45`                                  | Most of the way in ~175ms, never past                                                                   | A character growing into a field (a typed OTP character's copy, scaled), without going past its size                                                                                                                    |
| `spring.checkPop`  | `stiffness: 500, damping: 24`                                  | Lively, overshoots ~13% (peak at ~170ms)                                                                | A check popping in (`checkAnimation="pop"`), from `scale.icon` out of `blur.icon`; each slot of an OTP field's completion wave springing back                                                                           |
| `spring.entrance`  | `stiffness: 200, damping: 20`                                  | Playful                                                                                                 | Effects bringing content in (Fade, Slide, Zoom, Blur)                                                                                                                                                                   |
| `spring.progress`  | `stiffness: 300, damping: 35, restDelta: 0.01, restSpeed: 0.1` | Like Motion UI's progress bar: 90% in ~230ms, settled by ~550ms, no overshoot, no jump at rest          | A progress bar and its value                                                                                                                                                                                            |
| `spring.number`    | `stiffness: 90, damping: 50`                                   | Rolls without overshooting                                                                              | Numbers rolling to their value                                                                                                                                                                                          |

Every spring above has `type: 'spring'`.

## Tweens

Tweens are for fades, menus (opened all day long, so short and exact), disclosure heights and swaps.

| Token                      | Value                                            | Use for                                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transition.menu`          | `{ duration: 0.22, ease: ease.soft }`            | Menus, selects, comboboxes, navigation menus                                                                                                                                                    |
| `transition.overlay`       | `{ duration: 0.4, ease: ease.soft }`             | An overlay fading in (the page behind blurring from 0) and out: a dialog's, a sheet's, a drawer's                                                                                               |
| `transition.dialogFade`    | `{ duration: 0.4, ease: ease.soft }`             | A dialog's content fading in at once, ahead of its tilt                                                                                                                                         |
| `transition.fade`          | `{ duration: 0.2, ease: ease.out }`              | Content fading in place (a toast behind the front one)                                                                                                                                          |
| `transition.color`         | `{ duration: 0.2, ease: ease.color }`            | A highlight showing up from nothing or going (a hover lighting an item or a trigger), and its color changing (a trigger open, then hovered): never a cut; an OTP field's ring fading in and out |
| `transition.reveal`        | `{ duration: 0.3, ease: ease.out }`              | A label showing up once what moved has landed (a placeholder)                                                                                                                                   |
| `transition.disclosure`    | `{ duration: 0.35, ease: ease.soft }`            | Accordion and collapsible panels unfolding                                                                                                                                                      |
| `transition.panelOut`      | `{ duration: 0.15, ease: ease.leave }`           | A tab panel leaving into `blur.panel`, staying in the page, before the next one comes in (Motion's tabs example)                                                                                |
| `transition.panelIn`       | `{ duration: 0.3, ease: ease.enter }`            | The next tab panel fading in from `blur.panel`, once the previous one has gone                                                                                                                  |
| `transition.panelHeight`   | `{ duration: 0.45, ease: ease.resize }`          | The tab panels' height gliding from the previous panel's to the next one's as it comes in: Motion's own layout animation, no overshoot                                                          |
| `transition.check`         | `{ duration: 0.3, delay: 0.2, ease: ease.draw }` | A check drawing itself once the box has answered                                                                                                                                                |
| `transition.uncheck`       | `{ duration: 0.3, ease: ease.draw }`             | A check erasing itself                                                                                                                                                                          |
| `transition.fill`          | `{ duration: 0.3, ease: ease.fill }`             | A fill growing in from `scale.fill` as it fades in, and shrinking back out (a toggle group's selected surface, like the radio's and checkbox's fill); neighbouring fills joining or splitting   |
| `transition.popOut`        | `{ duration: 0.15, ease: ease.out }`             | A popped check, a removed chip or tag, shrinking back out; a deleted OTP character shrinking out                                                                                                |
| `transition.swap`          | `{ duration: 0.15, ease: ease.out }`             | Two icons or labels swapping in place                                                                                                                                                           |
| `transition.collapse`      | `{ duration: 0.28, ease: ease.inOut }`           | A sidebar collapsing or expanding, and everything resizing with it (the page beside it, its buttons, its group labels): one curve, so their edges stay together                                 |
| `transition.collapseLabel` | `{ duration: 0.14, ease: ease.out }`             | A collapsing sidebar's labels fading into `blur.icon` in its first half; back in its last half as it expands (delay `collapse − collapseLabel`)                                                 |
| `transition.handoffOut`    | `{ duration: 0.22, ease: ease.soft }`            | A menu's content leaving the popover it hands to the next menu (a menubar's), sliding away from where it goes: mostly gone in ~90ms                                                             |
| `transition.handoffIn`     | `{ duration: 0.26, ease: ease.arrive }`          | The next menu's content fading in behind it, once it has mostly cleared                                                                                                                         |
| `transition.dismiss`       | `{ duration: 0.2, ease: ease.away }`             | A dialog, a sheet or a toast dismissed: at once, quicker than it came, speeding away                                                                                                            |
| `transition.shake`         | `{ duration: 0.4, ease: ease.inOut }`            | A mark shaking "no" by `shift.shake`, a few dying swings (a toast's error cross, once half drawn)                                                                                               |
| `transition.drawerOut`     | `{ duration: 0.16, ease: ease.in }`              | A drawer closed: quick, seen speeding off its edge                                                                                                                                              |
| `transition.drawer`        | `{ duration: 0.4, ease: ease.drawer }`           | A drawer sliding in, snapping or easing back after a drag: a hint of bounce                                                                                                                     |
| `transition.sheet`         | `{ duration: 0.4, ease: ease.soft }`             | A sheet sliding in, no bounce (held against the screen's edge)                                                                                                                                  |
| `transition.instant`       | `{ duration: 0 }`                                | Deliberately no animation (reduced motion, a forced jump)                                                                                                                                       |

## Curves

Pick a tween's curve by what the element does:

| What it does                                            | Curve                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Enters or leaves                                        | `ease.out`: `cubic-bezier(0.23, 1, 0.32, 1)`                                         |
| Unfolds, dims the page, a menu opens, a sheet slides in | `ease.soft`: `cubic-bezier(0.215, 0.61, 0.355, 1)`                                   |
| A drawer slides in, with a hint of bounce               | `ease.drawer`: `cubic-bezier(0.34, 1.2, 0.64, 1)`                                    |
| A mark draws itself (a checkbox's check)                | `ease.draw`: `cubic-bezier(0, 0, 0.58, 1)`, Motion's `easeOut` (v1's)                |
| Moves or morphs on screen                               | `ease.inOut`: `cubic-bezier(0.77, 0, 0.175, 1)`, or Motion's `easeInOut` for loops   |
| A dialog or a sheet dismissed, speeding away            | `ease.away`: `cubic-bezier(0.33, 0.17, 0.67, 0.5)`, a steady push                    |
| A drawer closed, speeding off its edge                  | `ease.in`: `cubic-bezier(0.4, 0, 1, 1)`                                              |
| Fades in behind content leaving (a menubar's next menu) | `ease.arrive`: `cubic-bezier(0.11, 0, 0.5, 0)`, a slow start                         |
| A highlight showing up, going, or changing color        | `ease.color`: `cubic-bezier(0.25, 0.1, 0.25, 1)` (CSS's `ease`), gentle at both ends |
| Fades out to make way for the next (a tab panel)        | `ease.leave`: `cubic-bezier(0, 0, 0.58, 1)`, Motion's `easeOut` (Motion's tabs)      |
| Fades in where other content just left (a tab panel)    | `ease.enter`: `cubic-bezier(0.25, 0.1, 0.35, 1)`, `ease` landing longer              |
| Resizes to new content (a tab panel's height)           | `ease.resize`: `cubic-bezier(0.4, 0, 0.1, 1)`, Motion's layout curve                 |
| A fill grows in or shrinks out (a toggle group's)       | `ease.fill`: `cubic-bezier(0.4, 0, 0.2, 1)`, Tailwind's default (the radio's fill)   |
| Changes color (CSS)                                     | `ease`                                                                               |
| Moves constantly (marquee, loader)                      | `linear`                                                                             |
| Thrown off screen by a swipe                            | `linear`, at the finger's speed (see the Sheet recipe)                               |

`ease.out` starts fast, so the interface answers on the first frame, and does most of the movement in the first third. `ease.soft` starts softer, for surfaces the eye watches change: an accordion or collapsible pushing the page should be seen opening rather than snap open (after Motion's accordion example), an overlay should dim the page, not cut to dark, a menu, opened all day long, should be seen opening rather than snapped open, and a sheet should slow down all the way in. A drawer answers at once and goes a hair past its rest on `ease.drawer`: Vaul's `cubic-bezier(0.32, 0.72, 0, 1)` felt linear, zipping in and stopping, then crawled out. Never ease-in on UI: it starts slow, exactly when the user is watching. A dialog or a sheet dismissed speeds away on `ease.away` (`transition.dismiss`): a steady push from half its average speed to one and a half, so it leaves at once (CSS's ease-in waited on its first frames) and its last pixels don't crawl out. The one ease-in that moves something is a drawer closed (`transition.drawerOut`, 0.16s on `ease.in`): the steady push read as a linear slide there, and short, its slow start doesn't wait. `ease.arrive` only fades: as a menubar's popover is handed to the next menu, the next menu's content fades in on it (`transition.handoffIn`) behind the previous one fading out, so what leaves has mostly cleared before it shows, like Motion's mega menu; its slide (`spring.handoff`) and the popover's move (`spring.morph`) start at once.

## Scales

| Token           | Value | Use for                                                                                |
| --------------- | ----- | -------------------------------------------------------------------------------------- |
| `scale.press`   | 0.97  | Anything pressed (buttons, radio, toggles; not the checkbox). Nothing scales on hover. |
| `scale.tooltip` | 0.7   | Where tooltips (and anchored toasts) grow from                                         |
| `scale.popover` | 0.8   | Where popovers, hover cards and preview cards grow from                                |
| `scale.menu`    | 0.9   | Where menus, selects and navigation menus grow from                                    |
| `scale.dialog`  | 0.8   | Dialog content, with `perspective(500px) rotateX(-20deg)`                              |
| `scale.icon`    | 0.5   | An icon swapping for another                                                           |
| `scale.toast`   | 0.96  | Where a toast rising from its edge grows from (with `blur.surface`), and leaves to     |
| `scale.fill`    | 0.7   | Where a fill grows from, from its center (a toggle group's selected surface)           |

The smaller the element, the farther it starts, so its growth stays visible; the more often a large one opens, the subtler it gets. A tooltip's 0.7 is only a few pixels on a small label, a popover's 0.8 shows where it came from, a menu opened all day stays at 0.9.

## Blur

| Token             | Value       | Use for                                                                  |
| ----------------- | ----------- | ------------------------------------------------------------------------ |
| `blur.icon`       | `blur(2px)` | Icons and short labels swapping in place (copy → copied)                 |
| `blur.disclosure` | `blur(2px)` | The content of an accordion or collapsible panel, clearing as it unfolds |
| `blur.surface`    | `blur(4px)` | Surfaces coming in: dialogs, toasts                                      |
| `blur.panel`      | `blur(5px)` | Tab panels leaving into it, then the next one coming in from it          |

A light blur during a swap makes two overlapping states read as one shape changing. Keep it at these values on anything large: heavy blur is expensive to paint, especially in Safari.

## Shifts

| Token              | Value     | Use for                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shift.handoff`    | `6` (px)  | How far a menu's content slides as a menubar's popover is handed to the next menu: the leaving content away from where the popover goes, the next one in from there                                                                                                                                                                             |
| `shift.navigation` | `24` (px) | The same for a navigation menu's content, four times as far: across 400-600px, 6px barely shows (the leaving content fades out within ~90ms, the next one fades in once its spring is mostly done)                                                                                                                                              |
| `shift.tabs`       | `12` (px) | Tab panels' content changing, by the tabs' order: going to a later tab, the leaving content slides toward the start as it fades out (`transition.panelOut`) and the next one comes in from the end (`transition.panelIn`); vertical for vertical tabs, mirrored right to left. Inside a box (a Card) only the content moves, clipped by the box |
| `shift.shake`      | `3` (px)  | How far a mark swings as it shakes (`transition.shake`): a toast's error cross. Swings of 1, 0.66 and 0.33 times it, both ways                                                                                                                                                                                                                  |

Distances in px, for content that slides a little while it fades, whatever its size: a hint of direction, not a journey. A menubar's content slides 6px on screen, like Motion's mega menu, without a blur: it stays where it is while its popover slides over it, it doesn't swap in place.

## Staggers

| Token           | Value      | Use for                                                                                                                      |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `stagger.stack` | `0.03` (s) | A toast stack unfolding on hover, and folding back: each toast starts this long after the one in front of it (front to back) |

Delays between items moving one after another, in seconds, paced by `tempo` like durations (read them from `useMotionTokens()`). Only the change that unfolds or folds the group cascades: anything else that moves it afterwards (an item added, removed, swiped back) starts at once. None under reduced motion.

## Tempo

`tempo` paces every token at once: durations and delays are multiplied by it, and a stiffness/damping spring keeps its exact shape on the new time scale (stiffness / tempo², damping / tempo). Change it for an app or a subtree without touching any component:

```tsx
import { AnimateUIProvider } from '@animate-ui/react/provider';

<AnimateUIProvider tempo={0.8}>{children}</AnimateUIProvider>; // crisper; 1.2 is more relaxed
```

The provider is optional and nestable: the closest one sets what it's given, the rest comes from the one around it. `useTempoTransition(t)` applies it to one transition, `scaleTransition(t, tempo)` outside React. Curves, scales, blurs and shifts don't depend on it.

## Check animation

Checks (checkboxes', and the checks of menus, selects, comboboxes and lists) show and hide one of two ways, `CheckAnimation`:

- `draw` (the default): the stroke draws itself (`transition.check`, without its delay outside a checkbox) and erases itself (`transition.uncheck`);
- `pop`: in from `scale.icon` out of `blur.icon` on `spring.checkPop` (after the checkbox's 0.2s in a checkbox), back out on `transition.popOut`; a single selection's check glides from the item it leaves to the chosen one on `spring.highlight`.

```tsx
<AnimateUIProvider checkAnimation="pop">{children}</AnimateUIProvider>
```

A check's own `animation` prop wins. Inside a component, `useCheckAnimation(own)` returns the one to use (`@animate-ui/react/utils/motion`).

## CSS transitions

When the library drives a part with CSS (Base UI Drawer and Toast follow a swipe and a stack through CSS variables), set its timing from the same tokens. `toCssTiming(transition)` returns `{ duration, easing }` (milliseconds, a CSS timing function): a tween keeps its duration and cubic-bezier, and a spring becomes the `linear()` curve Motion itself would play.

```tsx
const enter = toCssTiming(useTempoTransition(transition.drawer));
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
