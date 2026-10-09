# Animate UI motion rules

The rules come in two families:

- **A. Quality rules** are about correctness, accessibility and performance. Breaking one is a bug, not a taste choice.
- **B. Style rules** are Animate UI's motion language: springs, curves, scales, blur. They are defaults, tunable through props, the tokens and `tempo`, but a component ships with them unless the user asks otherwise.

Every `@animate-ui/react` primitive follows them. The style draws on Emil Kowalski's practical tips (see NOTICE.md) without taking them to the letter: Animate UI keeps its springs, its overshoot and its longer surfaces, and adopts what makes motion clearer (origins, curves by role, press feedback, blur on swaps).

## A. Quality rules

### Accessibility

#### A1. Respect reduced motion in every component

Two pieces, always together:

- Wrap the component's motion tree in `ReducedMotionConfig`. Under reduced motion, Motion then skips individual transform props (`x`, `scale`, `rotate`), size, position and `layout` animations, and keeps animating opacity, color and filter.
- Motion does **not** skip a `transform` string. Neutralize it with `useShouldReduceMotion()`, called inside the wrapper.

```tsx
// Avoid: nothing checks the OS setting
<motion.div initial={{ opacity: 0, transform: 'scale(0.8)' }} animate={{ opacity: 1, transform: 'scale(1)' }} />

// Do
<ReducedMotionConfig>
  <Content />
</ReducedMotionConfig>

function Content() {
  const reduce = useShouldReduceMotion();
  const from = reduce ? 1 : scale.popover;
  return (
    <motion.div
      initial={{ opacity: 0, transform: `scale(${from})` }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
    />
  );
}
```

Reduced motion means gentler, not none: things still fade (and un-blur) in and out; nothing moves, grows or slides. CSS-driven parts zero their travel under `motion-reduce:` (CSS-driven recipe). JavaScript loops (canvas, `requestAnimationFrame`, `setInterval`) are not covered by Motion: stop them when `useShouldReduceMotion()` is true.

#### A2. The keyboard animates like the pointer

A selection moved with the arrow keys slides like a click, a panel opened with Enter opens like a tap, a menu opened from the keyboard plays its entrance. Don't track the input modality to skip animations. Only consider removing motion on actions triggered constantly from the keyboard, where it would become a wait (a command palette toggled 100 times a day, global shortcuts).

#### A3. Hover effects only on hover-capable pointers

Touch browsers fire `mouseenter` on tap and never fire `mouseleave`, so the hover state sticks. Motion's `whileHover` already ignores touch, and so do hover-driven library components (Radix Tooltip and Hover Card, Base UI Tooltip and Preview Card): don't add a gate to those. Gate hand-wired hover.

```tsx
// Avoid
onMouseEnter={() => setActive(value)}

// Do
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
onMouseEnter={canHover ? () => setActive(value) : undefined}
```

In CSS: `@media (hover: hover) and (pointer: fine) { … }`.

#### A4. Loops pause when nobody can see them

Infinite animations and canvas backgrounds pause off screen (`useInView`), in a hidden tab (`document.visibilityState`) and under reduced motion.

#### A5. The control answers on the frame of the interaction

The press scale and the state change (a checkbox's fill, a switch's track color) start on the frame of the interaction. A secondary flourish may follow: the check draws itself 0.2s later, once the box has answered.

### Physicality

#### A6. Anchored popups grow from their trigger

Popovers, tooltips, menus, hover cards and selects set `transform-origin` from the base library, inside the primitive, so they come out of what opened them. Modals are the exception: they stay centered.

| Library    | Origin                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix UI   | `var(--radix-<component>-content-transform-origin)` (e.g. `--radix-popover-content-transform-origin`)                                                                           |
| Base UI    | `var(--transform-origin)`                                                                                                                                                       |
| React Aria | `--trigger-anchor-point`, or the side facing the trigger from `data-placement` (`bottom` → `top`)                                                                               |
| Your own   | The point facing the trigger, with Motion's `originX` / `originY` (its layout projection takes them into account, so a popup gliding between triggers with `layoutId` keeps it) |

#### A7. Overlays don't appear from nothing

An overlay starts from a visible size: 0.7 at the smallest (a tooltip), more for larger and more frequent ones (B4). Only small marks inside a control (a radio dot, a typed character) and particles may pop from 0.

### Performance

#### A8. Animate transform, opacity and filter

```tsx
// Avoid: layout on every frame
animate={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}

// Do: a shared element
<motion.div layoutId="highlight" transition={spring.highlight} />
```

Height is the one exception, where content must push what's below: disclosures (`transition.disclosure`) and heights following their content (`spring.height`). And a menubar's popover handed to the next menu resizes to it (`width`/`height`, a Web Animation for its 250ms move, A16): a scale would change its items' size. Keep blur light (`blur.icon`, `blur.disclosure`, `blur.surface`); large blurs are expensive to paint.

#### A9. Prefer a `transform` string for press and continuous motion

Motion runs a `transform` string on the compositor (WAAPI); its `x`, `y` and `scale` shorthands run on the main thread. Use the string for press feedback, drags and anything long-running. An overlay that must end with `transform: none` (so a settled popup never becomes the containing block of fixed descendants) can use `scale`: Motion writes `none` once it's back to 1.

```tsx
whileTap={{ transform: `scale(${scale.press})` }}
```

#### A10. Pointer and scroll values never go through React state

Drive them with motion values (`useMotionValue`, `useScroll`, `useSpring`) so nothing re-renders.

```tsx
// Avoid
onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
```

#### A11. Name the properties you transition

Never `transition: all` / `transition-all`. List them: `transition-[opacity,transform]`, `transition-colors`.

### Behavior

#### A12. Interruptible by default

Re-triggering retargets from the current value; it never restarts. Springs carry their velocity when interrupted; tweens retarget too. Avoid keyframe arrays with a fixed first value on anything that can be re-triggered (hover, toggle), and `AnimatePresence mode="wait"` on fast swaps: it plays the exit and the entrance back to back (use `mode="popLayout"`).

#### A13. The library element stays the animated element

Animate the element the library renders (Radix `asChild`, Base UI `render`, React Aria `render` or `motion.create`) so its `data-*` attributes, `className` and `style` still apply. Same exports, props and `data-slot` as the original component.

#### A14. Warm tooltips show at once

Once a tooltip is open, moving to the next one shows it at once, without its entrance, and hides the previous one at once: the first tooltip's animation says "help is here", the next ones would only slow the reading down. 300ms after the last one closed, they play their entrance again. (Animate UI's own Tooltip glides its one popup from trigger to trigger instead.)

#### A15. Open from the start, it still animates

A popup or panel open on the first render (`defaultOpen`, a controlled `open`) plays its entrance on mount, page load included.

#### A16. A menubar's popover moves from menu to menu

Moving from an open menu of a menubar to another (hovering, clicking or tapping the next trigger, or the arrow keys), the popover doesn't close and reopen: the next menu takes the previous one's popover over, which moves to its place and resizes on the menu's own transition (`transition.menu`), and the content changes like Motion's mega menu. The content stays where it is on screen while the popover slides over it and clips it: the previous items leave `shift.handoff` (6px) away from where the popover goes while they fade out (`transition.handoffOut`); the next ones come in from 6px that way on `spring.handoff` and fade in behind them (`transition.handoffIn`). From File to Edit, File's items leave to the left and Edit's come from the right; a content riding along with the popover would read the other way round. One popover on screen at every frame, however fast the pointer sweeps the bar, interactive from its first frame. Going back and forth faster than the content settles, each menu's content shows once, never inside another's: what's still leaving goes on from where it is, and a menu coming back takes its items back from where they are and as they show, instead of them coming in again (blinking). The triggers share one highlight, like a menu's items: hovered, focused or with its menu open, a trigger's own background glides from the previous trigger (`spring.highlight`), fades in from nothing and fades out where it is once no trigger is lit. Under reduced motion each menu fades in place. Animate UI's Radix and Base UI menubars do it (internal/menu-handoff.ts; Menu recipe).

## B. Style rules

### B1. Springs first

Nearly everything moves on a spring from the tokens (`tokens.md`): they retarget with their velocity, and a little overshoot makes motion feel alive. Tweens are for fades, menus (opened all day long, so short and exact), disclosure heights and swaps. Each role has one token; never hand-type a stiffness and damping that a token already covers.

### B2. Pick a tween's curve by what the element does

- Entering or leaving: `ease.out` (`cubic-bezier(0.23, 1, 0.32, 1)`). It starts fast, so the interface answers at once.
- Surfaces the eye watches change, a panel unfolding and pushing the page (accordion, collapsible), an overlay dimming it, a menu opening or a sheet sliding in: `ease.soft` (`cubic-bezier(0.215, 0.61, 0.355, 1)`). A softer start, so the change is seen rather than snapped: on `ease.out`, a 200ms overlay is two-thirds in on its first frame.
- A drawer sliding in: `ease.drawer` (`cubic-bezier(0.34, 1.2, 0.64, 1)`), which answers at once and goes a hair past its rest (~1%), a hint of bounce its bleed covers.
- A mark drawing itself in a control (a checkbox's check): `ease.draw` (`cubic-bezier(0, 0, 0.58, 1)`, Motion's `easeOut`, v1's). Gentle, so the stroke is seen being drawn: on `ease.out`, a 0.2s check is half drawn on its first frames.
- Moving or morphing on screen: ease-in-out (`ease.inOut`, or Motion's `easeInOut` for loops).
- Color changes (CSS): `ease`.
- Constant motion (marquee, loader): `linear`.
- Never ease-in on UI: it starts slow, exactly when the user is watching. A dialog or a sheet dismissed speeds away on `ease.away` (`transition.dismiss`, 0.2s): a steady push from half its average speed to one and a half, so it leaves at once and its last pixels don't crawl out. The one ease-in that moves something is a drawer closed (`transition.drawerOut`, 0.16s on `ease.in`): short enough that its slow start doesn't wait, and it's seen speeding off its edge (a steady push read as a linear slide there).
- Content fading in behind content leaving (a menubar's next menu, A16): `ease.arrive` (`cubic-bezier(0.11, 0, 0.5, 0)`, `transition.handoffIn`, 0.3s), a slow start on its opacity only, so what leaves has mostly cleared before it shows. Its slide and the popover's move start at once.

```tsx
// Avoid
transition={{ duration: 0.2, ease: 'easeInOut' }} // a menu entering

// Do
transition={motionTransition.menu} // 0.25s, ease.soft
```

### B3. Fast where it's frequent, alive everywhere

Keep what's used constantly quick and let rarer surfaces take their time:

| Motion                            | Feel                                                                                          | Token                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Press                             | ~120ms                                                                                        | `spring.press`                                                                       |
| Menus, selects                    | 250ms, soft ease-out                                                                          | `transition.menu`                                                                    |
| A menubar moving to the next menu | the popover moves in 250ms; content out in 250ms, in on a ~250ms spring, fading in over 300ms | `transition.menu`, `transition.handoffOut`, `spring.handoff`, `transition.handoffIn` |
| Tooltips, popovers, hover cards   | there in ~200ms, settled by ~500ms                                                            | `spring.pop`                                                                         |
| Selection, pointer highlight      | a smooth slide / a quick follow                                                               | `spring.selection`, `spring.highlight`                                               |
| Disclosures                       | 350ms, soft ease-out                                                                          | `transition.disclosure`                                                              |
| Dialogs                           | ~450ms in, 200ms out                                                                          | `spring.dialog`, `transition.dismiss`                                                |
| Sheets                            | 400ms in, 200ms out                                                                           | `transition.sheet`, `transition.dismiss`                                             |
| Drawers                           | 400ms in, 160ms out                                                                           | `transition.drawer`, `transition.drawerOut`                                          |
| Their overlays                    | 400ms, both ways                                                                              | `transition.overlay`                                                                 |
| Effects, texts, numbers, icons    | expressive, their own rhythm                                                                  | `spring.entrance`, `spring.number`, own values                                       |

A tween on `ease.out` reads faster than its duration: most of the movement happens in its first third. Don't shorten durations to make something feel snappier; fix the curve first. The same goes the other way: a disclosure, an overlay or a menu on `ease.out` felt rushed, so they got the softer `ease.soft`.

### B4. Scale: press only, and from a size that fits

- Pressables (buttons, radio, toggles) scale to `scale.press` (0.95) on `spring.press` while pressed. **Nothing scales on hover**: hover changes color, a button answers the press. (Animate UI's buttons keep an opt-in `hoverScale`, 1 by default.) The checkbox doesn't scale at all: its fill and its check answer the click.
- Anchored popups grow from their trigger, from farther when they are small: tooltips `scale.tooltip` (0.7), popovers and hover cards `scale.popover` (0.8), menus `scale.menu` (0.9).
- A dialog tips forward from `perspective(500px) rotateX(-20deg) scale(0.8)`.

```tsx
// Avoid
whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}

// Do
whileTap={{ transform: `scale(${scale.press})` }} transition={spring.press}
```

### B5. The exit replays the entrance

Closing plays the entrance's transition in reverse: one transition both ways (`exitTransition` defaults to `transition`). Put the transition inside each target (`animate`, `exit`) so a leaving element keeps it, and use `exitTransition` when a component needs a different exit. Modals have theirs by default: dismissed, a dialog's content goes back the way it came, and a sheet off its edge, on `transition.dismiss`, at once and speeding away, a drawer on `transition.drawerOut`; their overlay clears on `transition.overlay`, like it came. Whatever unmounts the modal waits for its overlay to clear: one cut short snaps the page back sharp.

### B6. Blur to bridge a swap

When two states replace each other in place (an icon swapping for another, a label changing, a panel replacing another), a light blur makes their overlap read as one shape changing: `blur.icon` (2px) with `scale.icon` (0.5) and `transition.swap` for icons, `blur.surface` (4px) for panels. Dialogs also come in from `blur.surface`, a disclosure's content clears from `blur.disclosure` (2px) as its panel unfolds, and a combobox input's placeholder showing up clears from `blur.icon` on `transition.reveal` once the input has landed. A menubar's content changing as its popover moves to the next menu doesn't swap in place: it slides `shift.handoff` (6px) and fades, without a blur, like Motion's mega menu (A16).

### B7. Surfaces: modals tip, sheets slide

- **Dialog**: the content fades in at once (`transition.dialogFade`), un-blurs and tips forward from `perspective(500px) rotateX(-20deg) scale(0.8)` on `spring.dialog`; the overlay brings its background color and backdrop filter in from nothing on `transition.overlay` (the page behind blurs from 0; never fade an overlay's opacity over a `backdrop-blur`), and clears the same way. Dismissed, the content leaves on `transition.dismiss`. It stays centered.
- **Sheet**: slides from its edge by its own size (percentages, never pixels) while it fades, in on `transition.sheet` (no bounce: held against the screen's edge, going past its rest would open a gap there), out on `transition.dismiss`. The overlay comes and goes like a dialog's.
- **Drawer**: slides from its edge opaque, a sheet sliding in rather than a fade. It comes in, snaps and eases back after a drag on `transition.drawer` (0.4s on `ease.drawer`, a hint of bounce its bleed covers), and closes on `transition.drawerOut` (0.16s on `ease.in`), speeding off its edge. Thrown by a swipe, it keeps the finger's speed (linear). Its shadow lifts off the page with it, from none off screen. Its overlay comes in and clears exactly like a dialog's, and follows the drag.

### B8. One token set, one tempo

Values come from `@animate-ui/react/utils/motion`. To change the pace of everything, set `tempo` on `AnimateUIProvider` (`tokens.md`), not individual components; to pop checks instead of drawing them, its `checkAnimation`.

## Checklist

Quality (any miss is a bug):

- [ ] Wrapped in `ReducedMotionConfig`; `transform` strings neutralized with `useShouldReduceMotion()` (CSS: travel zeroed under `motion-reduce:`); loops stop under reduced motion
- [ ] The keyboard animates like the pointer
- [ ] Anchored popups set `transform-origin` in the primitive; modals stay centered
- [ ] Overlays start from a visible size (≥ 0.7)
- [ ] Only `transform`, `opacity` and `filter` animate (disclosure and content heights, and a menubar popover's size as it's handed over, excepted); blur stays light
- [ ] Hover gated to hover-capable pointers; the control answers on the frame of the interaction
- [ ] No `transition-all`; pointer values in motion values, not state
- [ ] Re-triggering retargets instead of restarting
- [ ] Warm tooltips show (and the previous one goes) at once
- [ ] Open from the start, it plays its entrance
- [ ] A menubar's popover moves to the next menu (one on screen at every frame) instead of closing and reopening, and its triggers share one gliding highlight
- [ ] Same exports, props and `data-slot` as the original component

Style (defaults; deviations named in the output):

- [ ] Springs from the tokens; tweens only for fades, menus, disclosures and swaps
- [ ] `ease.out` on enter and exit, `ease.soft` on disclosures, overlays, menus and sheets, `ease.draw` on a checkbox's check, ease-in-out on on-screen movement, `ease` on color, never ease-in (but a closed drawer's `transition.drawerOut`, and a menubar's next content fading in on `transition.handoffIn`; a dismissed dialog or sheet speeds away on `ease.away`)
- [ ] Press at `scale.press` (0.95), no hover scale; popups from 0.7 / 0.8 / 0.9 by kind
- [ ] The exit replays the entrance (a dismissed modal: at once, quicker, speeding away; its overlay clear before it unmounts)
- [ ] Swaps bridged with a light blur
