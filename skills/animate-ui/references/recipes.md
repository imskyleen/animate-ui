# Recipes

Start from the recipe that matches the component kind (see the table in SKILL.md). Each one is how the matching `@animate-ui/react` primitives move, and they have interaction tests for timing, reduced motion and keyboard behavior: read the primitives as reference implementations.

Every recipe assumes the base-library wiring from `base-libraries.md` (presence, mounted content, `ReducedMotionConfig`). Snippets show Radix; swap the mounting mechanism for Base UI or React Aria. Imports, once for all:

```tsx
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  scale,
  spring,
  transition as motionTransition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
```

## Overlay (Popover, Tooltip, Hover Card, Preview Card)

Purpose: spatial, it grows out of its trigger. It fades in and grows from its trigger on `spring.pop`, with a little overshoot, and leaves the same way.

```tsx
// Rendered inside ReducedMotionConfig (see base-libraries.md for the Portal part).
function PopoverContentMotion({
  className,
  children,
  transition,
  exitTransition,
  ...props
}: PopoverContentProps) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? spring.pop);
  const leave = useTempoTransition(exitTransition ?? transition ?? spring.pop);
  // `scale`, not a transform string: Motion writes `transform: none` once it
  // is back to 1, so a settled popup isn't the containing block of fixed
  // children.
  const hidden = { opacity: 0, scale: reduce ? 1 : scale.popover };

  return (
    // Library props, className and style on Content; motion on the child.
    <PopoverPrimitive.Content
      asChild
      forceMount
      data-slot="popover-content"
      className={className}
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{ opacity: 1, scale: 1, transition: enter }}
        exit={{ ...hidden, transition: leave }}
        style={{
          transformOrigin: 'var(--radix-popover-content-transform-origin)',
        }}
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  );
}
```

- Start by kind: tooltips from `scale.tooltip` (0.7), popovers, hover cards and preview cards from `scale.popover` (0.8). All on `spring.pop`, both ways.
- Scale only, no directional slide: the trigger-anchored origin already shows where it came from. Drop shadcn's `slide-in-from-*` and `zoom-in-*` classes.
- Tooltips warm up: once one is open, the next one shows at once (`initial={false}`, no transition) and the one it replaces is hidden at once with a `visibility: 'hidden'` style while its exit plays out unseen (a style, not a target: a leaving element keeps the targets of its last render, but its style still follows). 300ms after the last one closed, the next plays its entrance again. shadcn/ui gives each tooltip its own Provider, so the libraries' grouping (`data-state="instant-open"`, `data-instant`) never fires: track it across all tooltips in a module-level group (the open ones, a warm flag cleared 300ms after the last close, and the leaving ones to hide). React Aria does it itself (`shouldSkipAnimation`).
- `followCursor` on the Root (Animate UI's addition, as in v1; Radix Tooltip and HoverCard, Base UI Tooltip and PreviewCard): while the pointer moves over the trigger, the popup leans towards it by half its offset from the trigger's center, on a spring (stiffness 200, damping 17), on both axes or only `'x'` or `'y'`.
- Animate UI's own Tooltip (`@animate-ui/react/primitives/tooltip`) shares one popup per provider instead: moving to the next trigger glides it there with a layout animation, which reads better than closing and reopening.
- Positioned with Floating UI yourself: pass `open` to `useFloating` and mount the popup's content once `isPositioned` is true. Before that it sits at 0, 0, and a `layoutId` (or `layout`) animation would fly it in from the corner of the page.
- Open from the start (`defaultOpen`): it plays its entrance on mount, page load included.
- Everything the Content renders goes inside the `motion.div` (an Arrow too).
- shadcn's side offset classes (`data-[side=bottom]:translate-y-1`, …) can stay: Tailwind v4 applies them through the CSS `translate` property, which composes with the animated `transform`. With Tailwind v3 they would conflict; move the offset to `sideOffset`.
- Radix `Content` needs `forceMount` as well as the Portal, or it unmounts on close and the exit never plays.
- Extra movement such as following the cursor goes on the CSS `translate` property (`useMotionTemplate`), so it composes with the animated `transform`.

## Menu (Dropdown Menu, Context Menu, Menubar, Select, Combobox, Navigation Menu)

Purpose: spatial, but opened all day long: short and exact. The content fades and grows from `scale.menu` (0.9) in `transition.menu` (250ms, `ease.soft`), from its trigger (or the pointer, for a context menu), and closes the same way. Submenus move like their menu.

```tsx
const hidden = { opacity: 0, scale: reduce ? 1 : scale.menu };

<motion.div
  initial={hidden}
  animate={{ opacity: 1, scale: 1, transition: enter }} // transition.menu
  exit={{ ...hidden, transition: leave }}
  style={{
    transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
  }}
/>;
```

- One highlight glides behind the highlighted item on `spring.highlight` (quick, so it never trails the pointer), whether the pointer or the arrow keys move it. Hand it from item to item: the new item's surface starts from the previous one's position on screen, with its opacity and velocity, and the previous one goes in the same frame, so however fast the pointer or the arrow keys go there's one highlight and no trail (a shared `layoutId` would crossfade two copies). Only a highlight appearing from nothing fades in (`transition.fade`). Run the glide on the compositor (a Web Animation of `transform`, eased by the spring as a `linear()` curve with the handed velocity): a JS-driven glide stalls, then jumps, when a submenu mounts mid-glide. Submenus share their root menu's highlight, like v1. Into a submenu (or out), each menu clips its own surfaces: keep the trigger's surface and glide it along with the new one (same spring, same timing, toward the new item's box), so the two make one highlight crossing from one menu into the other, and fade the entering one in on the glide, as v1's shared layout did; drop the leaving one once its glide is over. Retarget it when the highlight moves on. Read the item's highlighted background once it has the focus too (Base UI and React Aria mark it highlighted a moment before they focus it, and a `focus:` background isn't there yet), and keep its own background cleared while it still has the focus (React Aria moves the focus a moment after the highlight: the item left would flash its `focus:` background).
- Checks are the same everywhere (menus' checkbox and radio items, selects, comboboxes, React Aria's `SelectionIndicator` in a ListBox or a Menu), in both check animations (`tokens.md` § Check animation). Keep every item's check mounted (Radix `forceMount`, Base UI `keepMounted`, Radix Select's indicator rendered by Animate UI on every item, React Aria's `SelectionIndicator` on every item) so a check can hide itself, and reuse the checkbox's indicator (internal/controls/indicator: the icon's SVG shapes and `pathLength` for `draw`, the icon itself for `pop`; a text check fades, or pops as an inline block). `draw`: a check draws itself (`transition.check` without its delay: no box to fill first) whenever it appears and erases itself (`transition.uncheck`); choosing another item of a single selection erases the old check while the new one draws. `pop`: a check pops in on `spring.checkPop` and out on `transition.popOut`; a single selection's check glides to the chosen item on `spring.highlight` (it lands with the highlight), between the items of its group: the group pairs the check leaving with the one arriving in the same commit (before the next frame), shows the new one at once and glides it from where the old one is on screen (a Web Animation of `translate`, added to the element's own), the old one hiding at once; alone, a check pops. A gliding check's element must be a box: a translate doesn't apply to an inline `<span>` (a plain indicator inside the positioned one), so make it a block when it's alone in its slot (it lays out the same; `inline-flex` sat 2.5px off). When choosing an item closes the list or the menu and its check changes (the item has a check, and isn't the chosen one already), hold still for 150ms before closing, so the change is seen; closing any other way doesn't wait.
- A popover kept by AnimatePresence while it exits keeps the element it last rendered: give it its latest props (a context) so what's inside goes on updating (a menu's selection changes as it closes, and its checks change).
- A combobox's chips (Base UI's Chips, React Aria's TagGroup and Tags) and the input after them: a chip added pops in from half its size with a fade (`spring.pop`); a removed one leaves the selection at once while a copy of it (aria-hidden, inert, no ids) shrinks out where it was, out of the flow, back to half its size and transparent (`transition.popOut`, one Web Animation for both so they share a progress). Either way, the chips after it and the input glide from where they were (FLIP: `translate` added to their own, on `spring.reflow`) instead of jumping, and the field grows or shrinks to a line more or less (a Web Animation of its `height` on the same timing). Measure where the chips land with the field held at its height before: a field centering its rows would otherwise move them a second time as it resizes (11px in shadcn/ui's). The copy drops the chip's `data-slot`: still counted as a chip, it would keep shadcn/ui's field on its narrower padding until it goes, and everything would jump by 6px then. A placeholder showing up as its input glides back (the last chip removed) waits for the input to land (hidden until its glide is less than half a pixel away) instead of riding along, then fades in from `blur.icon` on `transition.reveal` (opacity only under reduced motion); one there all along goes with it. `::placeholder` can't take an inline style or a Web Animation everywhere: a rule on an attribute reads CSS variables the input carries, and Motion animates those (the part renders the rule as a `<style href precedence>`). Read where everything is before the DOM changes: while the new chip renders (it's not on the page yet), and when a chip is about to go (its unmount, still on the page); glide once the commit is over, before the next frame. React Aria renders a TagList and its tags in a hidden tree to build its collection: share the motion from the TagGroup (around both), find the real elements through the tags' refs (their detach is the removal), and lay out from the real TagList's box (shadcn/ui's is `display: contents`, beside the input). It removes the real tag in a second commit, after the page around it changed (an input's placeholder): read where everything is when the tag leaves the hidden tree. Nothing glides under reduced motion, and a removed chip only fades.
- Navigation menu: content swapped inside the viewport fades in from `blur.surface` (`transition.menu`); the viewport's size follows the active content in 250ms too.
- Select, Radix: needs `@radix-ui/react-select` 2.x (bundled in `radix-ui` 1.4+) for `forceMount`. **Don't gate the whole Portal with `AnimatePresence`**: while closed, Radix renders the items off-screen to show the selected label in the trigger, power typeahead and fill the hidden native `<select>`. Animate the open content inside its own `AnimatePresence`, and once the exit completes (`onExitComplete`) render a plain, non-`forceMount` `SelectPrimitive.Content` with the same children so that fallback comes back. Reset the flag during render when it reopens, so a controlled `open` works too:

  ```tsx
  const [hasExited, setHasExited] = React.useState(!isOpen);
  if (isOpen && hasExited) setHasExited(false);
  // …<AnimatePresence onExitComplete={() => setHasExited(true)}>{isOpen && animated}</AnimatePresence>
  // {!isOpen && hasExited && <SelectPrimitive.Portal><SelectPrimitive.Content …>{body}</SelectPrimitive.Content></SelectPrimitive.Portal>}
  ```

- Select, `position="item-aligned"` (Radix) or `alignItemWithTrigger` (Base UI): fade only. The list is measured on mount to line the selected item up with the trigger, and there is no origin variable.
- Select, Base UI 1.8: its Portal has no `keepMounted`. Pass an `actionsRef` to the Root, animate the Popup on the open state, and call `actionsRef.current.unmount()` when the exit completes. `Select.Value` shows the raw value unless the Root gets `items`.
- Radix Context Menu's Root takes no `open`/`defaultOpen`, only `onOpenChange`: mirror it into state for presence.

## Modal (Dialog, Alert Dialog)

Purpose: state, the page is now in a modal mode. Modals stay centered: no trigger origin.

```tsx
const TIPPED = `perspective(500px) rotateX(-20deg) scale(${scale.dialog})`;
const UPRIGHT = 'perspective(500px) rotateX(0deg) scale(1)';

function DialogContentMotion({
  transition,
  exitTransition,
  children,
  ...props
}: DialogContentProps) {
  const reduce = useShouldReduceMotion();
  const enter = useTempoTransition(transition ?? spring.dialog);
  const leave = useTempoTransition(
    exitTransition ?? transition ?? spring.dialog,
  );
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

- The content fades in, un-blurs and tips forward to upright on `spring.dialog` (no overshoot), and leaves the same way.
- `from` (Animate UI's addition, as in v1) picks the edge it tips from: `top` by default and `right` turn it by -20deg, `bottom` and `left` by 20deg, around the X axis for top and bottom, the Y axis for left and right.
- The overlay fades its background color and backdrop filter in from nothing (`transparent` / `none`) to its classes' values, as a Web Animation (`useBackdropFade` in internal/modal-motion: any color syntax interpolates), never its opacity: with a `backdrop-blur` class, an opacity fade cross-fades the sharp page with an already blurred one, and the blur seems not to start at 0. On `transition.overlay` (400ms, `ease.soft`), a little ahead of the content, and the same way out. On a strong ease-out, a short overlay reads as a cut.
- Drop the blur at rest if the content holds fixed-position children (`transitionEnd: { filter: 'none' }`): a `filter` makes it their containing block.

## Disclosure (Accordion, Collapsible)

Purpose: continuity, the content below doesn't jump. This is where `height` animates.

```tsx
const collapsed = { height: 0, opacity: 0, filter: blur.disclosure };
const expanded = {
  height: 'auto',
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' }, // no filter left at rest
};

<AnimatePresence>
  {isOpen && (
    <AccordionPrimitive.Content asChild forceMount>
      <motion.div
        initial={collapsed}
        animate={expanded}
        exit={collapsed}
        transition={useTempoTransition(
          transition ?? motionTransition.disclosure,
        )}
        style={{ overflow: 'hidden' }}
      />
    </AccordionPrimitive.Content>
  )}
</AnimatePresence>;
```

- The height grows from 0 while the content fades in from `blur.disclosure` (2px), in `transition.disclosure` (350ms, `ease.soft`), both ways. After Motion's accordion example: the soft ease-out lets the eye follow the content open, where `ease.out` would snap it open.
- The panel clips its content at its bottom edge, right where the next item (its border) starts: fade that edge while it moves, with a mask over 16px or over the part still hidden (`max(100% - 16px, 200% - contentHeight)`, the content's height measured when it starts moving), and drop it at rest. A hard cut there reads as the content stuck to the border.
- An item open by default unfolds on mount, page load included: no `initial={false}`.
- Reduced motion: the height jumps; the fade and the blur still play.
- Derive each item's open state from the root value; never copy it into state with an effect. With a single-value root the value is a string, so compare with `===`, not `includes` (`'item-10'.includes('item-1')` is true).
- Chevron: it turns 180° with the panel, on its timing (`transition-transform duration-350 ease-[cubic-bezier(0.215,0.61,0.355,1)]`), so the two read as one gesture.

## Sheet (Sheet, Drawer)

Purpose: spatial, it comes from its edge.

```tsx
const offscreen: Record<Side, string> = {
  right: 'translateX(100%)',
  left: 'translateX(-100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
};

// Same transform function on both ends: Motion can't interpolate
// `translate(0, 0)` with `translateX(100%)`.
const shown =
  side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
const hidden = { opacity: 0, transform: reduce ? shown : offscreen[side] };

<motion.div
  initial={hidden}
  animate={{ opacity: 1, transform: shown, transition: enter }} // spring.sheet
  exit={{ ...hidden, transition: leave }}
/>;
```

- It slides from its edge by its own size (percentages, never pixel offsets) while it fades, on `spring.sheet`, both ways. Under reduced motion it fades in place.
- The overlay fades like a modal's.
- Drag to dismiss: use a library that decides dismissal on velocity (Animate UI's Radix Drawer, Base UI 1.8's Drawer with the CSS-driven recipe below). Don't reimplement it.

## Indicator (Tabs, Toggle Group, Navigation Menu, Sidebar active item)

Purpose: spatial, the selection moves between items.

- A shared element with `layoutId` (Animate UI's `Highlight` in children mode) on `spring.selection`: the new surface slides from the previous one while the old copy fades out 200ms later. A spring keeps fast clicking smooth: it retargets with its velocity.
- The keyboard moves it like a click.
- Panels: the incoming panel fades in from `blur.surface` on `transition.panel` (500ms, `ease.out`: most of it shows in the first 150ms) while the panels' height springs from the previous one's on `spring.height`; the outgoing panel goes at once, so they never overlap. Drop the blur at rest (`transitionEnd: { filter: 'none' }`).
- Tab text color: `transition-colors duration-500 ease`.
- Never follow an item by animating `top`, `left`, `width` or `height`.
- Base UI Tabs don't select on focus since 1.0 (`activateOnFocus` is `false`): arrow keys move focus, Enter or Space selects.
- `ReducedMotionConfig` around the Root turns the `layoutId` move into a jump.

## Press (Button, Toggle, Checkbox, Switch, Radio)

Purpose: feedback.

- Press: ``whileTap={{ transform: `scale(${scale.press})` }}`` (0.95) on `spring.press`. Write the resting `transform: 'scale(1)'` in `initial`: Motion can only interpolate a missing transform from `scale(0)`. No hover scale.
- Switch: the thumb stretches toward the middle of the track while pressed (×19/16 of its width) and glides to its side on `spring.thumb`; the track color changes at once.
- Checkbox: the box doesn't scale; it answers at once with its fill (in the demos, a `before:` layer that grows from 70% as it fades in over 300ms, CSS in the classes, so it's nearly full when the check starts; the layer covers the border, `before:-inset-px`, and the border keeps its color, or an outline rings the growing fill); the check draws itself (stroke and opacity together) on `transition.check` (0.3s after 0.2s, `ease.draw`) and erases on `transition.uncheck` (0.3s, `ease.draw`); with `checkAnimation="pop"`, it pops in after the same 0.2s on `spring.checkPop` and out on `transition.popOut`.
- Radio: the dot pops in from 0 on `spring.bounce` and out the same way.
- When Base UI renders the control as a `<button>`, pass `nativeButton`. React Aria controls expose their state through render props: put `ReducedMotionConfig` outside the primitive so the root's motion element is covered too.

## Swap (copy → copied, sun → moon, a label changing)

Purpose: state. Two states replace each other in place, briefly overlapping: a light blur makes the overlap read as one shape changing.

```tsx
<span className="relative inline-flex">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={copied ? 'copied' : 'copy'}
      initial={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
      transition={motionTransition.swap}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </motion.span>
  </AnimatePresence>
</span>
```

- `mode="popLayout"`: the old icon leaves while the new one arrives. The `relative` wrapper keeps the leaving one in place even while the button around it is scaled by its press.
- `initial={false}`: nothing animates on mount.
- Larger content (a panel, a card) uses `blur.surface` and its own recipe's transition.

## CSS-driven by the base library (Base UI Drawer, Toast)

When the library drives a gesture (swipe to dismiss) or a stack and exposes it through CSS variables and data attributes, use CSS transitions. Validated on Animate UI's Base UI Drawer and Toast.

- **One transform, built from local variables.** Write a single `transform` whose functions never change between states, and let data attributes change only the variables (`--x-y`, `--x-scale`, `--x-exit-y`, `--x-travel`). Same functions in the same order means every state interpolates, including the inline transform the library sets while swiping.
- **Read the library's variables:** Drawer `--drawer-swipe-movement-x/y`, `--drawer-snap-point-offset`, `--drawer-swipe-progress`, `--drawer-swipe-strength`; Toast `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-x/y`.
- **Enter / exit:** `data-starting-style:` and `data-ending-style:` set the off-screen offset, a percentage of the element's own size (`100%`). For a drawer, scale the exit by the flick: `calc(var(--drawer-swipe-strength) * <exit duration>)`.
- **Timing from the tokens:** `toCssTiming(useTempoTransition(spring.sheet))` gives the CSS duration and easing (a spring becomes the `linear()` curve Motion would play), so the edge entrance matches the JS sheets and `tempo` reaches CSS too. Set them as inline CSS variables. An anchored toast pops from its anchor like a tooltip (`spring.pop`, from `scale.tooltip`).
- **While swiping:** `data-swiping:duration-0` so it follows the finger, plus the compound `data-ending-style:data-swiping:duration-[…]` so a swipe dismissal still animates (both attributes have the same specificity and the later rule wins).
- **Reduced motion:** multiply the off-screen offset by a travel variable and set it to 0 under `motion-reduce:` (`[--drawer-travel:1] motion-reduce:[--drawer-travel:0]`), rather than overriding `transform` (direction variants are more specific and would win). Keep travel at 1 during a swipe dismissal so a dragged drawer keeps leaving. Toasts: `motion-reduce:[--toast-travel:0%] motion-reduce:transition-opacity`.
- **Stacks:** toasts behind scale down subtly (`max(0.9, 1 - index * 0.05)`), never below 0.9; hovering (or tapping) the viewport expands them on the same spring. Toasts fire rapidly: transitions, never keyframes. They exit through the edge they came from, or keep going in the swipe direction.
- **Direction-specific styles** come from the library's `data-swipe-direction` / `data-side` attributes, so the primitive needs no context.
- In Tailwind arbitrary values, write `_+_` / `_-_` around calc operators next to `var(--…)`: automatic spacing is unreliable there.
- Test swipes with realistic gestures (small moves one frame apart): a single big jump doesn't register as a swipe.
