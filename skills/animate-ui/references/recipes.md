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

Purpose: spatial, but opened all day long: short and exact. The content fades and grows from `scale.menu` (0.9) in `transition.menu` (220ms, `ease.soft`), from its trigger (or the pointer, for a context menu), and closes the same way. Submenus move like their menu. A menubar hands one popover from menu to menu (see Menubar below).

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

- One highlight glides behind the highlighted item on `spring.highlight` (quick, so it never trails the pointer), whether the pointer or the arrow keys move it. Hand it from item to item: the new item's surface starts from the previous one's position on screen, with its opacity and velocity, and the previous one goes in the same frame, so however fast the pointer or the arrow keys go there's one highlight and no trail (a shared `layoutId` would crossfade two copies). Only a highlight appearing from nothing fades in, and a highlight going fades out, on `transition.color` (CSS's `ease`: a strong ease-out is 85% in after 40ms and reads as a cut); one taking over a fade halfway (another surface's showing up or going, or one gone less than 120ms ago, a submenu closing before the next item is highlighted) gets back to full at once on `transition.fade`, or it would dip; the surface's color changes on the same curve, from the previous surface's color when the new item's highlighted background differs (a destructive item; an open trigger's `bg-muted/50`, then hovered `bg-muted`). Run the glide on the compositor (a Web Animation of `transform`, eased by the spring as a `linear()` curve with the handed velocity): a JS-driven glide stalls, then jumps, when a submenu mounts mid-glide. Submenus share their root menu's highlight, like v1. Into a submenu (or out), each menu clips its own surfaces: keep the trigger's surface and glide it along with the new one (same spring, same timing, toward the new item's box), so the two make one highlight crossing from one menu into the other, and fade the entering one in on the glide, as v1's shared layout did; drop the leaving one once its glide is over. Retarget it when the highlight moves on. Read the item's highlighted background once it has the focus too (Base UI and React Aria mark it highlighted a moment before they focus it, and a `focus:` background isn't there yet), and keep its own background cleared while it still has the focus (React Aria moves the focus a moment after the highlight: the item left would flash its `focus:` background).
- Checks are the same everywhere (menus' checkbox and radio items, selects, comboboxes, React Aria's `SelectionIndicator` in a ListBox or a Menu), in both check animations (`tokens.md` § Check animation). Keep every item's check mounted (Radix `forceMount`, Base UI `keepMounted`, Radix Select's indicator rendered by Animate UI on every item, React Aria's `SelectionIndicator` on every item) so a check can hide itself, and reuse the checkbox's indicator (internal/controls/indicator: the icon's SVG shapes and `pathLength` for `draw`, the icon itself for `pop`; a text check fades, or pops as an inline block). `draw`: a check draws itself (`transition.check` without its delay: no box to fill first) when its item is checked and erases itself (`transition.uncheck`) when it's unchecked; choosing another item of a single selection erases the old check while the new one draws. `pop`: a check pops in on `spring.checkPop` and out on `transition.popOut`; a single selection's check glides to the chosen item on `spring.highlight` (it lands with the highlight), between the items of its group: the group pairs the check leaving with the one arriving in the same commit (before the next frame), shows the new one at once and glides it from where the old one is on screen (a Web Animation of `translate`, added to the element's own), the old one hiding at once; alone, a check pops. In both, only checking and unchecking animate: a check mounting with its list or menu (it opens) shows at rest, one mounting in a list already there (rendered for the chosen item only) was just checked and animates in, and closing leaves the checks as they are. A gliding check's element must be a box: a translate doesn't apply to an inline `<span>` (a plain indicator inside the positioned one), so make it a block when it's alone in its slot (it lays out the same; `inline-flex` sat 2.5px off). When choosing an item closes the list or the menu and its check changes (the item has a check, and isn't the chosen one already), hold still before closing (`PICK_HOLD`: 250ms while the check draws itself, so it's ~95% drawn when the list starts to fade; 150ms while it pops or glides), so the change is seen; closing any other way doesn't wait.
- A popover kept by AnimatePresence while it exits keeps the element it last rendered: give it its latest props (a context) so what's inside goes on updating (a menu's selection changes as it closes, and its checks change).
- A combobox's chips (Base UI's Chips, React Aria's TagGroup and Tags) and the input after them: a chip added pops in from half its size with a fade (`spring.pop`); a removed one leaves the selection at once while a copy of it (aria-hidden, inert, no ids) shrinks out where it was, out of the flow, back to half its size and transparent (`transition.popOut`, one Web Animation for both so they share a progress). Either way, the chips after it and the input glide from where they were (FLIP: `translate` added to their own, on `spring.reflow`) instead of jumping, and the field grows or shrinks to a line more or less (a Web Animation of its `height` on the same timing). Measure where the chips land with the field held at its height before: a field centering its rows would otherwise move them a second time as it resizes (11px in shadcn/ui's). The copy drops the chip's `data-slot`: still counted as a chip, it would keep shadcn/ui's field on its narrower padding until it goes, and everything would jump by 6px then. A placeholder showing up as its input glides back (the last chip removed) waits for the input to land (hidden until its glide is less than half a pixel away) instead of riding along, then fades in from `blur.icon` on `transition.reveal` (opacity only under reduced motion); one there all along goes with it. `::placeholder` can't take an inline style or a Web Animation everywhere: a rule on an attribute reads CSS variables the input carries, and Motion animates those (the part renders the rule as a `<style href precedence>`). Read where everything is before the DOM changes: while the new chip renders (it's not on the page yet), and when a chip is about to go (its unmount, still on the page); glide once the commit is over, before the next frame. React Aria renders a TagList and its tags in a hidden tree to build its collection: share the motion from the TagGroup (around both), find the real elements through the tags' refs (their detach is the removal), and lay out from the real TagList's box (shadcn/ui's is `display: contents`, beside the input). It removes the real tag in a second commit, after the page around it changed (an input's placeholder): read where everything is when the tag leaves the hidden tree. Nothing glides under reduced motion, and a removed chip only fades.
- Navigation menu: moving between items, the content changes in place like a menubar's handoff (internal/content-swap.ts: a `ContentSwapper` per viewport or popup; the content leaving is copied as it leaves, the one coming in announced, and both run once the commit is done, in a microtask, whichever order their effects ran in). The copy leaves `shift.handoff` away from where the next content comes from (Radix's `data-motion` from-start/from-end, Base UI's `activationDirection`) on `transition.handoffOut`, the next content comes in from there on `spring.handoff` and fades in on `transition.handoffIn`; one layer per content, keyed by a stable id, and back to a content still leaving takes its copy's place and opacity. The viewport (Radix) only resizes (its size follows the active content on `spring.morph`, with an explicit `velocity` read from its own running spring, bounded by `startOf`: Motion's `getVelocity()` is 0 after 30ms without a frame; the resize observer's first report of a new content doesn't restart it); Base UI's popup also moves to the next trigger: set the Positioner's CSS transition aside and move the popup with an added `translate` Web Animation on `spring.morph` (`MoveFollower`), carrying its speed from move to move (internal/momentum.ts: as much of it as goes toward the next place without passing it, none the other way), and time Base UI's size transition (CSS, which it waits for) in the frame it holds the popup at its current size, before it writes the next one (`SizeFollower`: Base UI forces the style before a microtask could time it; carrying a speed on, the CSS transitions are started from when Base UI read the size, like the move, or the size lags the position by a frame; the timing goes back to the plain curve once they started; back at `auto`, nothing is moving), the content coming in pinned where it rests and the copies where they are on screen. Start every move over together (each jump of the positioner, each element pinned while it moves) from where things are, in one task: animations created in one task start on the same frame, while syncing a new one to a running one's `currentTime` lags it a frame (tens of pixels on a long move). The content coming in stays hidden until the popup has its place (Base UI places it a frame or two after the switch). Hiding the content Base UI is still removing: cancel its own animations first (they'd show it again over the copy, and Base UI waits for them). Contents slide `shift.navigation` (24px: 6px barely shows across a wide content). Leaving contents are kept by element, so one shown again before it left (React's StrictMode remount, Base UI showing a still-mounted or kept-mounted content again) never left; Base UI's contents enter and leave on their open state's changes, not on mount (it reuses elements), and a content leaving is copied before it's unpinned (unpinning cancels its move and shifts it). A content coming in by a switch before the one leaving (a submenu's) waits a frame, hidden. Closing, a content the library removes before its popup has faded out leaves a copy holding still in its place. Under reduced motion nothing is copied: the next content fades in place. A menu without a popup (a submenu in a content) still configures its swapper (the root's fallback timings). Give every animation of a move restart one start time: created in one task, Chrome still started an element just added's a frame early, one switch in ~8. Moving (the new curve starting at speed: `carries`, not the incoming velocity, which a turn back drops), start them at the time where things were read, on the element's own document's timeline (a long task since showed nothing: they catch up instead of stopping, then jumping); from rest, created paused and started together on the next frame (after a long task, they'd jump ahead). Measure a popup's offset without its own CSS `translate`. The triggers and the top-level links share one highlight like a menubar's, each content's links another (`TriggerHighlightScope` at the root and in each content); the List and each content are `isolation: isolate` (not the root: the Radix viewport must stay above the page). Clear a lit trigger's own background before reading its paint: read first, a `transition-all` would fade its background from there, a second highlight.
- Navigation menu triggers, clicked: a mouse reaches a trigger before it clicks it, and that opens its item (or switches the menu to it); a click within 500ms of that keeps the menu open (Base UI's "patient click", `PATIENT_CLICK_THRESHOLD`). Base UI 1.8 keeps it only after a hover opened the menu from closed (its switch path clears the trigger's `openEvent` and never arms `stickIfOpen`): the Root records a `trigger-hover` change from one item to another (`onValueChange`), and the Trigger calls `event.preventBaseUIHandler()` on a pointer click (`event.detail > 0`) of the active trigger within 500ms, once (the next click toggles), pinning the item like Base UI's own patient click does (the Root cancels its hover closes until another change); the switch counts only while the item switched to is the one shown (a controlled value once applied). Radix always toggles: the Root's mirror records which item opened, when, and whether a click opened it (the Trigger marks every click Radix acts on until the pointer enters a trigger again: Radix's hover timer, armed on arrival, can still open the item after a click closed it; Radix also reports the same value again from that timer: ignore it), and the Trigger calls `event.preventDefault()` (Radix skips its toggle), once, and never on a link trigger (it would cancel the navigation). Later clicks, clicks on an item a click opened, and the keyboard toggle as usual.
- Menubar: moving from an open menu to another (hovering, clicking or tapping the next trigger, or the arrow keys), the next menu takes the previous one's popover over instead of one closing and the other opening, like Motion's mega menu (internal/menu-handoff.ts: a `HandoffGroup` per menubar, `useMenuHandoff` in each of its menus' popovers, `useHandoffNested` in their submenus; context menus open on their own). The popover that moves is the next menu's, interactive from its first frame: it starts at the previous one's opacity, unscaled, without its entrance (`takeOver`, keyframes from that opacity, so a kept-mounted menu doesn't start from its closed one), and Web Animations move it from the previous one's position (`translate`, `composite: 'add'`) and resize it from its size (`width`/`height`, measured without its transform, its items on one line and clipped on the way) on one curve (`spring.morph`, or the menu's own `transition`), carrying on the previous popover's velocity (read with its rect: internal/momentum.ts), all its move's animations given one start time (when the previous popover was read if it was moving, so it catches up after the next menu's mount; from rest, the first frame it shows). Its margins make up the size difference (`marginRight`/`marginBottom` from the difference to 0), so the box Floating UI places keeps its rest size and it's placed once: otherwise a menu above the bar, aligned to its end or center, or shifted from an edge jumps on the second frame. Never scale it: its items would change size. The content stays where it is on screen while the popover slides over it: each of the popover's children, and the copy of the previous content, is moved back by as much as the popover moves (the same timing, `composite: 'add'` like the popover's own move: the browser runs added animations on the main thread, and a plain `translate` animation on the compositor, a frame ahead of the popover's, so the content would jump aside as the move starts; a test reading computed values can't see it, screencast frames can). Each child fades in (`transition.handoffIn`, on `ease.arrive`) and comes in from `shift.handoff` (6px) toward where the popover went (`spring.handoff`, added too), while the copy (cloned children, running animations frozen where they are, scroll offsets kept, ids, test ids, `tabindex` and collection attributes stripped, submenus left out, `aria-hidden`, `inert`), placed absolutely inside the popover and clipped by it, leaves 6px the other way and fades out (`transition.handoffOut`), then is removed. Decide it on the open edge, during render: the source is the latest menu still open, or one that closed because the user moved on (Base UI's `trigger-hover`, `trigger-focus`, `focus-out`, `list-navigation` and `sibling-open` reasons, and an `outside-press` on its own menubar: a tap, or a click without hover-open) and is still shown. Write the open flags in a passive effect, so a menu opening in the same commit as another one closes still sees it open: Radix switches menus in one commit, Base UI opens the next one before closing the previous on hover and closes first on ArrowLeft or a tap. Read the source's rect and copy its content in a layout effect; swap in that frame's rendering, after Floating UI has placed the new popover and before it's painted: a resize observer on the new popover reports then, even when it opened during an animation frame (Base UI opens a pressed menu in one), with a frame callback as the fallback. Then hide the source and its submenus (`visibility: hidden`) and make it leave at once (Radix: complete its exit's opacity and scale animations, so AnimatePresence unmounts it; Base UI: `unmount()` once it's closed), or focus and Escape would still go to it. A menu that opened and closed before its swap ran passes its source on to the next one (`pending`): the popover on screen is that one's. Moving on again before it has landed, it hands over from where it is, with what it shows. Each menu's content is one layer (the copy is keyed by its popover's id, the same at each opening): a copy never holds an older one, and what was still leaving inside the previous popover moves into the next one as it is on screen and goes on leaving from there (its opacity and slide read, its fade and slide started again from them on `transition.handoffOut`, its position held by the new move). Back to a menu whose copy is still leaving, the copy goes and the menu's own items start where it was and as it showed (their slide from its offset, their fade from its opacity) instead of coming in again: going back and forth faster than the content settles, nothing piles up or blinks. With a `transition` of 0, it moves and swaps at once (no copy). Don't give focus back to a Base UI menu's trigger when the user moved on (that trigger, focused, would open it again). Under reduced motion there's no handoff: each menu fades in place. The bar's triggers share one highlight, like a menu's items (internal/item-highlight.tsx: `TriggerHighlightScope` in the bar, `useTriggerHighlight` in each trigger; Base UI's `Menu.Trigger` only under a menubar's menu): a trigger is lit while its own styles paint it as it's hovered (the pointer, not `:hover`, which can lag), focused or with its menu open, and its background is cleared then; the surface glides from trigger to trigger on `spring.highlight`, goes back to the latest trigger still lit when the one it's on goes dark, and fades out where it is (`transition.fade`) when none is, lit again meanwhile coming back from there. The bar is `isolation: isolate`, so the surface sits under the triggers' text.
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
  animate={{ opacity: 1, transform: shown, transition: enter }} // transition.drawer
  exit={{ ...hidden, transition: leave }}
/>;
```

- It slides from its edge by its own size (percentages, never pixel offsets) while it fades, in on `transition.sheet` (0.4s on `ease.soft`, no bounce: held against the screen's edge, going past its rest would open a gap there) and out on `transition.dismiss` (`leave`), speeding off its edge. Under reduced motion it fades in place.
- The overlay comes and goes like a modal's.
- A drawer doesn't fade: it slides opaque. In, between snap points and back after a drag on `transition.drawer` (0.4s on `ease.drawer`: it answers at once and goes a hair past its rest, ~1%, which its bleed covers; a spring starts from rest and seems to hesitate, Vaul's curve zips in, stops, and crawls out). Closed, out on `transition.drawerOut` (0.16s on `ease.in`), seen speeding off its edge: a steady push read as a linear slide. Thrown by a swipe, it keeps the finger's speed: `linear`, over the time the rest of the way takes at that speed (Base UI's bounds: 0.2–4 px/ms, 80–360ms). Its shadow lifts off the page with it, from none off screen (`scrubShadow` in internal/modal-motion, by its position), so it doesn't ride out at full strength. Its overlay comes in and clears exactly like a dialog's, and follows the drag: a paused Web Animation from nothing to its classes' values, scrubbed by the drawer's position (`scrubBackdrop` in internal/modal-motion), never its opacity (over a background image, its opacity).
- Drag to dismiss: use a library that decides dismissal on velocity (Animate UI's Radix Drawer, Base UI 1.8's Drawer with the CSS-driven recipe below). Don't reimplement it.

## Indicator (Tabs, Toggle Group, Navigation Menu, Sidebar active item)

Purpose: spatial, the selection moves between items.

- A shared element with `layoutId` (Animate UI's `Highlight` in children mode) on `spring.selection`: the new surface slides from the previous one while the old copy fades out 200ms later. A spring keeps fast clicking smooth: it retargets with its velocity.
- The keyboard moves it like a click.
- Never follow an item by animating `top`, `left`, `width` or `height`.
- Base UI Tabs don't select on focus since 1.0 (`activateOnFocus` is `false`): arrow keys move focus, Enter or Space selects.
- `ReducedMotionConfig` around the Root turns the `layoutId` move into a jump.

### Tabs (internal/tabs)

Like Motion's Radix tabs example (motion.dev/examples/react-radix-tabs):

- One indicator, never two crossfading: a single surface sliding on `spring.selection`, a Web Animation of its `translate` (on the compositor, so the panels changing never hold it up) and of its `width`/`height` only when the tabs' sizes differ (a scale would distort the copied border, radius and shadow). Picked up on the way (quick clicks, arrow keys), it goes on from where it is with the speed it had (internal/momentum), from the frame it was read at. It copies the active tab's classes and data attributes and hides the tab's own surface. All of this is the library tabs' (Radix UI, Base UI, React Aria): Animate UI's own Tabs keep v1's motion, by the user's choice.
- Tab text color: `transition.color` (200ms, `ease`), whatever the tabs' own transition.
- Panels one after the other, like `AnimatePresence` `mode="wait"`: the outgoing panel fades out into `blur.panel` on `transition.panelOut` (150ms, `ease.leave`), kept mounted, in the page and `inert`; the incoming one waits `hidden` until it's gone, then fades in from `blur.panel` on `transition.panelIn` (300ms, `ease.enter`) while its height glides from the outgoing panel's to its own on `transition.panelHeight` (450ms, `ease.resize`: Motion's layout curve), clipped on the way. Changed again on the way: a panel passed over never shows, one leaving fades out from where it is, one picked again comes back from there, the height goes on from where it is.
- A panel holding a box (shadcn's Card) keeps the box on screen, as in Motion's example where the bordered box stays: find the panel's frame (the panel if it paints a border, a background or a shadow, else the first element down its chain of single children that does) and fade only its content (its child elements); the next panel's frame takes over at the same height in the same commit, then glides its own height (min/max-height, clipping only vertically, so its border, corners and ring are always drawn). Fading the whole panel blinks the Card's border, and gliding the panel's height cuts the Card's bottom edge. Decide when the panel starts leaving, from the panel coming in: frames that don't look the same (border, radius, background, shadow) or that hold text right inside fade whole. A `filter` makes the faded element the containing block of what's positioned inside it against an element outside it (Fumadocs' step badge): fade those without the blur.
- The content slides `shift.tabs` (12px) by the tabs' order, on the fades' own animations (one Web Animation per element: opacity, filter, `translate`), so it moves and fades as one gesture: toward the start leaving for a later tab, in from the end; the reverse going back; along Y for vertical tabs, mirrored in RTL. Turned back while it comes in, it goes back out from where it is. Under reduced motion, and for content `anchorsOutside` (a `translate` re-anchors it like a `filter`), no slide.
- Radix reports an uncontrolled value change from an effect, a commit late: in that commit a leaving panel is unmounted, then mounted again (losing its animations). Drive Radix's Root as controlled from your own state so the panels know the value in the same render.
- Keep a leaving panel mounted the library's way: Radix with `forceMount` (its Presence only waits for CSS animations); Base UI and React Aria wait for the element's running animations, so start the fade out as Web Animations in the commit it leaves in (a layout effect, before React Aria's own looks). Start each animation at the time it's made (`startTime`, `fill: 'backwards'`): left pending, it starts at the frame's time, which a long render leaves behind, and skips its first frames.
- Nothing moves on page load, nor before the page is painted (a value restored in an effect). Under reduced motion the indicator and the height jump; the panels still go one after the other, fading only (no blur).

### Toggle Group (internal/controls/highlight)

Radix UI, Base UI and React Aria toggle groups. shadcn/ui paints the items themselves (`data-[state=on]:bg-muted`, `hover:bg-muted`): the group reads each item's own background and corners and paints them on its own surfaces, behind the items and under their borders, in the group's shadow root around a `<slot>` (children added to the group would break the items' `first:` / `last:` styles); a stylesheet clears the items' own backgrounds.

- Multiple selection: a selected item's surface grows in from `scale.fill` (70%, from its center) as it fades in, on `transition.fill` (300ms, `ease.fill`), and shrinks back out as it fades.
- Neighbours selected together join into one surface on `transition.fill`: each stretches to the middle of the gap (0.5px past it, so no seam shows) as its inner corners square off; deselecting one splits them. They join when they touch, or across a gap no wider than half their height when the facing sides have no border: bordered items apart keep their own surfaces (a band between two frames reads as a stray strip). Geometry, not transforms: the merge changes corners and lengths, which a scale would distort. Rows, columns and RTL from the items' boxes.
- Single selection: one surface slides on `spring.selection`; picked up on the way it keeps its speed (internal/momentum's `startOf`), started from the frame it was drawn on (a negative `delay`), else its first frame stalls. Grows in on the first selection, shrinks out when cleared.
- Hover: one highlight glides on `spring.highlight`, fades in from nothing and out on `transition.color` (back to full on `transition.fade` when taken over halfway), like a menubar's triggers. Lit only where the hover style paints something the selection doesn't; above the selected surfaces; it stays over an item clicked until the surface growing or sliding in under it has arrived (fading as the surface grows shows a dip), and lights at once over a surface deselected under it.
- A pressed item's surfaces follow its press scale (read from its box each frame while pressed).
- Reduced motion: fades only. A single selection crossfades between items; a fill fading in next to a selected one covers the gap (and the neighbour's rounded corners) as it fades; the highlight jumps.

## Press (Button, Toggle, Checkbox, Switch, Radio)

Purpose: feedback.

- Press: ``whileTap={{ transform: `scale(${scale.press})` }}`` (0.97) on `spring.press`. Write the resting `transform: 'scale(1)'` in `initial`: Motion can only interpolate a missing transform from `scale(0)`. No hover scale.
- Switch: the thumb stretches toward the middle of the track while pressed (×19/16 of its width) and glides to its side on `spring.thumb`; the track color changes at once.
- Checkbox: the box doesn't scale; it answers at once with its fill (in the demos, a `before:` layer that grows from 70% as it fades in over 300ms, CSS in the classes, so it's nearly full when the check starts; the layer covers the border, `before:-inset-px`, and the border keeps its color, or an outline rings the growing fill); the check draws itself (stroke and opacity together) on `transition.check` (0.3s after 0.2s, `ease.draw`) and erases on `transition.uncheck` (0.3s, `ease.draw`); with `checkAnimation="pop"`, it pops in after the same 0.2s on `spring.checkPop` and out on `transition.popOut`. Only checking and unchecking animate: a box already checked when it mounts (the page loading, a dialog opening) shows its check at rest, as the server rendered it.
- Radio: the dot pops in from 0 on `spring.bounce` and out the same way, when the selection changes; a radio already selected when it mounts shows its dot at rest. Its fill grows like the checkbox's: in the demos, a `before:` layer that grows from 70% as it fades in over 300ms (and shrinks back as it fades out), covering the border, which keeps its color.
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
- **Enter / exit:** `data-starting-style:` and `data-ending-style:` set the off-screen offset, a percentage of the element's own size (`100%`). A drawer thrown by a swipe (`data-swipe-dismiss` with `data-ending-style`) keeps the finger's speed: `linear` over `calc(var(--drawer-swipe-strength, 1) * 360ms)`, Base UI's longest release, which the strength scales down to the time the rest of the way takes at that speed.
- **Timing from the tokens:** `toCssTiming(useTempoTransition(transition.drawer))` gives the CSS duration and easing (a tween keeps its cubic-bezier, a spring becomes the `linear()` curve Motion would play), so the drawer matches the JS one and `tempo` reaches CSS too. Set them as inline CSS variables. An anchored toast pops from its anchor like a tooltip (`spring.pop`, from `scale.tooltip`).
- **While swiping:** `data-swiping:duration-0` so it follows the finger, plus the compound `data-ending-style:data-swiping:duration-[…]` so a swipe dismissal still animates (both attributes have the same specificity and the later rule wins).
- **A backdrop that follows the swipe** without fading its opacity: read its classes' color and backdrop blur once it mounts (with `transition: none`, so nothing transitions), hold them as variables, and let the stylesheet scale them by a level built from `--drawer-swipe-progress`, at 0 in `data-starting-style` / `data-ending-style`: `color-mix(in srgb, var(--color) calc(var(--level) * 100%), transparent)` and `blur(calc(var(--blur) * var(--level)))`, `!important` to beat the classes. Register the level (`@property`, `<number>`) and transition it, not the color and the filter: the tint and the blur follow it on every frame.
- **Unmounting waits for the backdrop:** Base UI unmounts a closed drawer once its Popup's own animations have played, and a slower backdrop was cut short, the page snapping back sharp. When the Popup gets `data-ending-style`, give it an empty Web Animation as long as what's left of the backdrop's (`popup.animate([], { duration })`): Base UI waits for it too.
- **A shadow that lifts:** add `box-shadow` to the Popup's transitions and drop it (`none`) in `data-starting-style` / `data-ending-style`: it grows as the drawer comes in and fades as it leaves.
- **Reduced motion:** multiply the off-screen offset by a travel variable and set it to 0 under `motion-reduce:` (`[--drawer-travel:1] motion-reduce:[--drawer-travel:0]`), rather than overriding `transform` (direction variants are more specific and would win). Keep travel at 1 during a swipe dismissal so a dragged drawer keeps leaving. Toasts: `motion-reduce:[--toast-travel:0%] motion-reduce:transition-opacity`.
- **Stacks:** toasts behind scale down subtly (`max(0.9, 1 - index * 0.05)`), never below 0.9; hovering (or tapping) the viewport expands them on the same spring, front to back (`transition-delay: calc(var(--toast-index) * stagger.stack)`, only on the render where the stack expands or collapses: a change later must not wait). Toasts fire rapidly: transitions, never keyframes. They rise from the edge they came from (from `scale.toast` out of `blur.surface`, on `spring.toast`, which lands a little past its rest) and leave the same way on `transition.dismiss`, or keep going in the swipe direction.
- **A toast thrown by a swipe** keeps the finger's speed: Base UI gives no swipe strength for toasts, so read the pointer yourself (its event times over the last 100ms before letting go) and go `linear` over the time the toast's own size takes at that speed, between 80 and 360ms. While it's swiped, set the transform yourself from the same pointer: the right way it follows the finger and fades (gone at its own size away), the wrong way it rubber-bands (half the finger's way, then saturating at 48px; Base UI's own square-root damping barely moves).
- **A toast updated in place:** copy what changes before React does (`getSnapshotBeforeUpdate`: the icon, the title and description found by the Root's `aria-labelledby` / `aria-describedby`), put the copies back over the content inside the Root and let them leave into `blur.icon` (the icon also shrinking to `scale.icon`, a spinner's copy carrying on its turn) on `transition.swap`, while the new text comes out of the blur. Base UI measures the new height with `height: auto`, which cuts a CSS `height` transition: glide the height with a Web Animation started in the same commit, from the height it had to the one measured the same way.
- **A remaining-time bar:** one Web Animation of `scaleX` over the toast's timeout, real time (no tempo), paused whenever Base UI pauses its timers (the Root's `data-expanded`, the window blurred) and resumed from there; started over when the timer is (a loading toast resolved, a new timeout). Opt-in.
- **Direction-specific styles** come from the library's `data-swipe-direction` / `data-side` attributes, so the primitive needs no context.
- In Tailwind arbitrary values, write `_+_` / `_-_` around calc operators next to `var(--…)`: automatic spacing is unreliable there.
- Test swipes with realistic gestures (small moves one frame apart): a single big jump doesn't register as a swipe, and moves sent in one burst coalesce into one. For a flick, give the moves their own times (CDP's `Input.dispatchMouseEvent` takes a `timestamp`), one frame apart: a busy machine then can't stretch the flick into a slow drag.
