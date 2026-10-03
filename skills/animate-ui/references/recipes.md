# Recipes

Start from the recipe that matches the component kind (see the table in SKILL.md). All recipes are validated: they come from Animate UI's rewritten Tooltip, Dialog, Accordion, Sheet, Tabs and Switch, which have interaction tests for timing, reduced motion and keyboard behavior, and fresh agents used them to animate shadcn's Popover, Dropdown Menu, Hover Card and Select.

Every recipe assumes the base-library wiring from `base-libraries.md` (presence, mounted content, `ReducedMotionConfig`). Snippets show Radix; swap the mounting mechanism for Base UI or Headless UI.

## Overlay (Popover, Tooltip, Dropdown Menu, Hover Card, Select)

Gate: occasional (popover, dropdown: 200 to 400ms) or used constantly (tooltip: up to 250ms). Purpose: spatial, it grows out of its trigger.

```tsx
// Rendered inside ReducedMotionConfig (see base-libraries.md for the Portal part).
function TooltipContentMotion({
  className,
  children,
  transition = motionTransition.tooltip,
  ...props
}: TooltipContentProps) {
  const { isWarm } = useTooltip();
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    // Library props, className and style on Content; motion only on the child.
    <TooltipPrimitive.Content
      asChild
      forceMount
      data-slot="tooltip-content"
      className={className}
      {...props}
    >
      <motion.div
        initial={isWarm ? false : hidden}
        animate={{ opacity: 1, transform: 'scale(1)', transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
        }}
      >
        {children}
      </motion.div>
    </TooltipPrimitive.Content>
  );
}
```

- Enter with `transition.tooltip` (0.2s) for tooltips, `transition.dropdown` (0.3s) for popovers, menus and selects. Exit with `transition.exit` (0.2s), set inside the `exit` target.
- Scale only, no directional slide: the trigger-anchored origin already shows where it came from. Drop shadcn's `slide-in-from-*` classes.
- Hover Card and Preview Card use popover timing (`transition.dropdown` in, `transition.exit` out). Their open delay already keeps a sweep across triggers calm, so they don't need the warm skip.
- Select, Radix: needs `@radix-ui/react-select` 2.x (bundled in `radix-ui` 1.4+) for `forceMount`. **Don't gate the whole Portal with `AnimatePresence`**: while closed, Radix renders the items off-screen to show the selected label in the trigger, power typeahead and fill the hidden native `<select>`. Animate the open content inside its own `AnimatePresence`, and once the exit completes (`onExitComplete`) render a plain, non-`forceMount` `SelectPrimitive.Content` with the same children so that fallback comes back. Reset the flag during render when it reopens, so a controlled `open` works too:

  ```tsx
  const [hasExited, setHasExited] = React.useState(!isOpen);
  if (isOpen && hasExited) setHasExited(false);
  // …<AnimatePresence onExitComplete={() => setHasExited(true)}>{isOpen && animated}</AnimatePresence>
  // {!isOpen && hasExited && <SelectPrimitive.Portal><SelectPrimitive.Content …>{body}</SelectPrimitive.Content></SelectPrimitive.Portal>}
  ```

  Share the Content body (scroll buttons, Viewport) between both paths, and omit `transformOrigin` in item-aligned mode. Test it: pick an item, close, and check the trigger shows its label.

- Select, `position="item-aligned"` (Radix) or `alignItemWithTrigger` (Base UI): fade only. The list is measured on mount to line the selected item up with the trigger, and there is no origin variable.
- Select, Base UI 1.8: its Portal has no `keepMounted`. Pass an `actionsRef` to the Root, animate the Popup on the open state, and call `actionsRef.current.unmount()` when the exit completes. Base UI may still keep a closed popup mounted: set `hidden` on it once the exit has played so it leaves the accessibility tree. `Select.Value` shows the raw value unless the Root gets `items`.
- Everything the Content renders goes inside the `motion.div`: Select's scroll buttons and Viewport, an Arrow, etc.
- shadcn's side offset classes (`data-[side=bottom]:translate-y-1`, …) can stay: Tailwind v4 applies them through the CSS `translate` property, which composes with the animated `transform`. With Tailwind v3 they would conflict; move the offset to `sideOffset`.
- Reopening while the exit is still playing mounts a fresh element instead of retargeting the leaving one. That's expected for presence-gated overlays given the short exit. While it exits, Radix still blocks outside clicks for those 200ms; that's acceptable.
- Menus (Dropdown Menu, Context Menu, Menubar): the item highlight follows hover, so leave keyboard mode on `onPointerMoveCapture` (not only pointer down), and also record a keydown on the trigger (opening from the keyboard highlights the first item). In keyboard mode set the Highlight's `exitDelay` to 0 so the old highlight doesn't linger. Give each submenu its own Highlight. Item indicators (check, radio dot) fade with `transition.fade`, no scale.
- Radix `Content` needs `forceMount` as well as the Portal, or it unmounts on close and the exit never plays.
- Radix Context Menu's Root takes no `open`/`defaultOpen`, only `onOpenChange`: mirror it into state for presence instead of `useControlledState`.
- Submenus (Dropdown Menu, Context Menu, Menubar) are opened dozens of times a day: fade only, no scale, with `transition.exit` (0.2s) both ways. They read the same `--radix-dropdown-menu-content-transform-origin`. Closing the root menu closes them; both exit together.
- Origin: in the primitive, from the library variable (Base UI: `var(--transform-origin)`).
- Tooltips only: skip the entrance when warm. Track the last close time in a module-level variable and compare on open:

```tsx
const WARM_WINDOW_MS = 300;
let lastTooltipCloseAt = 0;

const handleOpenChange = (open: boolean) => {
  if (open) setIsWarm(Date.now() - lastTooltipCloseAt < WARM_WINDOW_MS);
  else lastTooltipCloseAt = Date.now();
  setIsOpen(open);
};
```

This works even when each tooltip has its own Provider (shadcn's `Tooltip` does), which disables the library's own grouping.

- Extra movement such as following the cursor goes on the CSS `translate` property (`useMotionTemplate`), so it composes with the animated `transform` instead of fighting it.

## Modal (Dialog, Alert Dialog)

Gate: occasional. Purpose: state, the page is now in a modal mode. Modals stay centered: no trigger origin.

```tsx
// Rendered inside ReducedMotionConfig, within the Portal next to the overlay.
function DialogContentMotion({
  from,
  transition,
  children,
  ...props
}: DialogContentProps) {
  const reduce = useShouldReduceMotion();
  const hiddenTransform = reduce
    ? getContentTransform(from, 'visible')
    : getContentTransform(from, 'hidden');

  return (
    <DialogPrimitive.Content
      asChild
      forceMount
      data-slot="dialog-content"
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, transform: hiddenTransform }}
        animate={{
          opacity: 1,
          transform: getContentTransform(from, 'visible'),
          transition: transition ?? motionTransition.modal,
        }}
        exit={{
          opacity: 0,
          transform: hiddenTransform,
          transition: transition ?? motionTransition.modalExit,
        }}
      >
        {children}
      </motion.div>
    </DialogPrimitive.Content>
  );
}
```

- Default: `scale.enter` (0.95) and opacity. Enter with `transition.modal` (0.4s), exit with `transition.modalExit` (0.25s): put each transition inside its own target so they differ.
- The overlay only fades, with the same pair of transitions. No blur: it costs paint and isn't visible on a translucent backdrop.
- Expressive variants (Animate UI's `from` prop: a 20° 3D flip from an edge) are opt-in props, never the default. Build the transform with a helper so the variant and the reduced-motion case share one code path:

```tsx
function getContentTransform(
  from: DialogFlipDirection | undefined,
  progress: 'hidden' | 'visible',
) {
  const scaleValue = progress === 'hidden' ? scale.enter : 1;
  if (!from) return `scale(${scaleValue})`;
  const axis = from === 'top' || from === 'bottom' ? 'rotateX' : 'rotateY';
  const angle =
    progress === 'hidden'
      ? from === 'bottom' || from === 'left'
        ? '20deg'
        : '-20deg'
      : '0deg';
  return `perspective(500px) ${axis}(${angle}) scale(${scaleValue})`;
}
```

## Disclosure (Accordion, Collapsible)

Gate: occasional to frequent; ~300ms because the content below moves with it (budget in `rules.md`, B2). Purpose: continuity, content below doesn't jump. This is the one place `height` animates.

```tsx
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

function AccordionContent({
  transition = motionTransition.disclosure,
  style,
  ...props
}: AccordionContentProps) {
  const { isOpen } = useAccordionItem();
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <AccordionPrimitive.Content asChild forceMount>
          <motion.div
            data-slot="accordion-content"
            initial={collapsed}
            animate={expanded}
            exit={collapsed}
            transition={transition}
            style={{ overflow: 'hidden', ...style }}
            {...props}
          />
        </AccordionPrimitive.Content>
      )}
    </AnimatePresence>
  );
}
```

- `transition.disclosure`: 0.3s ease-out. Height only, plus opacity: no slide, no animated mask.
- `AnimatePresence initial={false}`: items open by default don't animate on page load.
- Reduced motion: `height` is skipped by `ReducedMotionConfig` automatically (it jumps); opacity still fades. Wrap the Root.
- Derive each item's open state from the root value; never copy it into state with an effect. With a single-value root the value is a string, so compare with `===`, not `includes` (`'item-10'.includes('item-1')` is true).
- Chevron: `transition-transform duration-300 ease-out-strong`, matching the disclosure.

## Sheet (Sheet, Drawer)

Gate: occasional. Purpose: spatial, it comes from its edge.

```tsx
const offscreen: Record<Side, string> = {
  right: 'translateX(100%)',
  left: 'translateX(-100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
};

function SheetContentMotion({
  side = 'right',
  transition,
  children,
  ...props
}: SheetContentProps) {
  const reduce = useShouldReduceMotion();
  // Same transform function on both ends: Motion can't interpolate
  // `translate(0, 0)` with `translateX(100%)`.
  const shown =
    side === 'left' || side === 'right' ? 'translateX(0%)' : 'translateY(0%)';
  const hidden = reduce
    ? { opacity: 0, transform: shown }
    : { opacity: 1, transform: offscreen[side] };

  return (
    <SheetPrimitive.Content asChild forceMount {...props}>
      <motion.div
        data-slot="sheet-content"
        initial={hidden}
        animate={{
          opacity: 1,
          transform: shown,
          transition: transition ?? motionTransition.drawer,
        }}
        exit={{
          ...hidden,
          transition: transition ?? motionTransition.drawerExit,
        }}
      >
        {children}
      </motion.div>
    </SheetPrimitive.Content>
  );
}
```

- Percentages of the element's own size, never pixel offsets: it works whatever the sheet's width.
- `transition.drawer` (0.5s, `ease.drawer`) in, `transition.drawerExit` (0.3s) out. The overlay fades like a modal's.
- No fade while sliding: the slide already explains it. Under reduced motion it fades in place instead.
- Drag to dismiss: use Base UI 1.8's Drawer with the CSS-driven recipe below; it decides dismissal on velocity itself. Don't reimplement it.

## Indicator (Tabs, Toggle Group, Navigation Menu, Sidebar active item)

Gate: used constantly (springs up to ~0.4s visual, bounce ≤ 0.15). Purpose: spatial, the selection moves between items.

- A shared element with `layoutId` (Animate UI's `Highlight` in children mode) and `spring.snappy` (0.4s visual, bounce 0.15: a hint of overshoot), and a spring keeps clicking quickly through tabs smooth because it retargets with its velocity.
- Keyboard selection moves it instantly (`transition.instant`). Track the last input on the root with **capture-phase** handlers: Headless UI's `Tab` stops the propagation of arrow keys, so a bubbling `onKeyDown` on the group never fires.

```tsx
const [isKeyboard, setIsKeyboard] = React.useState(false);

<TabsPrimitive.Root
  {...props}
  onKeyDownCapture={(event) => { setIsKeyboard(true); onKeyDownCapture?.(event); }}
  onPointerDownCapture={(event) => { setIsKeyboard(false); onPointerDownCapture?.(event); }}
/>

<Highlight transition={isKeyboard ? motionTransition.instant : spring.snappy} … />
```

- Base UI Tabs don't select on focus since 1.0 (`activateOnFocus` is `false`): arrow keys move focus, Enter or Space selects.
- Panels: the incoming panel fades in with `transition.fade` (0.25s); the outgoing one unmounts at once. No `AnimatePresence mode="wait"`, no `layout` on the panel, no blur.
- Never follow an item by animating `top`, `left`, `width` or `height`.
- Trigger color: `transition-colors duration-150`.
- `ReducedMotionConfig` around the Root turns the `layoutId` move into a jump.

## Press (Button, Toggle, Checkbox, Switch, Radio)

Gate: used constantly. Purpose: feedback. Validated on the Switch; the scale guidance applies to the others.

- Press feedback: ``whileTap={{ transform: `scale(${scale.press})` }}`` (`scale.press`, 0.96) with `transition.press` (0.15s). No hover scale-up on small controls.
- Switch thumb: `layout` with `spring.snappy`. The thumb moves because the root's justification changes, and `layout` animates that with transforms.
- A size change on press (the iOS-style stretch) is a plain style change animated by `layout`, never a tweened `width`: set `data-pressed` on the thumb and style it (`data-pressed:w-(--switch-pressed-width)`).
- Icons inside a control fade (`transition.fade`), no scale from 0. Use `initial={false}` so they don't animate on mount.
- Track background color: `transition-colors duration-150`.
- Checkbox check: responds on the same frame, no delay.
- When Base UI renders the control as a `<button>`, pass `nativeButton`. Headless UI controls expose their state through a render prop: put `ReducedMotionConfig` outside the primitive so the root's motion element is covered too.

## CSS-driven by the base library (Base UI Drawer, Toast)

Gate: occasional. When the library drives a gesture (swipe to dismiss) or a stack and exposes it through CSS variables and data attributes, use CSS transitions. Validated on Animate UI's Base UI Drawer and Toast.

- **One transform, built from local variables.** Write a single `transform` whose functions never change between states, and let data attributes change only the variables (`--x-y`, `--x-scale`, `--x-exit-y`, `--x-travel`). Same functions in the same order means every state interpolates, including the inline transform the library sets while swiping.
- **Read the library's variables:** Drawer `--drawer-swipe-movement-x/y`, `--drawer-snap-point-offset`, `--drawer-swipe-progress`, `--drawer-swipe-strength`; Toast `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-x/y`.
- **Enter / exit:** `data-starting-style:` and `data-ending-style:` set the off-screen offset, a percentage of the element's own size (`100%`). Exit faster with a `data-ending-style:duration-*` override; for a drawer scale it by the flick: `data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)]`.
- **Curves and durations as utilities:** `ease-drawer` (drawer, `duration-500` in / 300ms out), `ease-out-strong` (toast, `duration-400` in / `duration-200` out). These classes mirror the `drawer`/`drawerExit` and modal-range tokens but `tempo` doesn't reach them: change them by hand to change the pace.
- **While swiping:** `data-swiping:duration-0` so it follows the finger, plus the compound `data-ending-style:data-swiping:duration-[…]` so a swipe dismissal still animates (both attributes have the same specificity and the later rule wins).
- **Reduced motion:** multiply the off-screen offset by a travel variable and set it to 0 under `motion-reduce:` (`[--drawer-travel:1] motion-reduce:[--drawer-travel:0]`), rather than overriding `transform` (direction variants are more specific and would win). Keep travel at 1 during a swipe dismissal (`data-swipe-dismiss:[--drawer-travel:1]`) so a dragged drawer keeps leaving. Toasts: `motion-reduce:[--toast-travel:0%] motion-reduce:transition-opacity`.
- **Stacks:** toasts behind scale down subtly (`max(0.9, 1 - index * 0.05)`), never below 0.9; hovering (or tapping) the viewport expands them with the same curve. Toasts fire rapidly: transitions, never keyframes. They exit through the edge they came from, or keep going in the swipe direction.
- **Direction-specific styles** come from the library's `data-swipe-direction` / `data-side` attributes, so the primitive needs no context.
- In Tailwind arbitrary values, write `_+_` / `_-_` around calc operators next to `var(--…)`: automatic spacing is unreliable there.
- Test swipes with realistic gestures (small moves one frame apart): a single big jump doesn't register as a swipe.
