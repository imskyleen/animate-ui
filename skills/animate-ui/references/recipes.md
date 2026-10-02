# Recipes

Start from the recipe that matches the component kind (see the table in SKILL.md). All recipes are validated: they come from Animate UI's rewritten Tooltip, Dialog, Accordion, Sheet, Tabs and Switch, which have interaction tests for timing, reduced motion and keyboard behavior, and fresh agents used them to animate shadcn's Popover, Dropdown Menu, Hover Card and Select.

Every recipe assumes the base-library wiring from `base-libraries.md` (presence, mounted content, `ReducedMotionConfig`). Snippets show Radix; swap the mounting mechanism for Base UI or Headless UI.

## Overlay (Popover, Tooltip, Dropdown Menu, Hover Card, Select)

Gate: occasional (popover, dropdown) or tens of times a day (tooltip). Purpose: spatial, it grows out of its trigger.

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

- Enter with `transition.tooltip` (0.15s) for tooltips, `transition.dropdown` (0.2s) for popovers, menus and selects. Exit with `transition.exit` (0.15s), set inside the `exit` target.
- Scale only, no directional slide: the trigger-anchored origin already shows where it came from. Drop shadcn's `slide-in-from-*` classes.
- Hover Card and Preview Card use popover timing (`transition.dropdown` in, `transition.exit` out). Their open delay already keeps a sweep across triggers calm, so they don't need the warm skip.
- Select, Radix: needs `@radix-ui/react-select` 2.x (bundled in `radix-ui` 1.4+), which accepts `forceMount` on Portal and Content; older versions can't animate the exit. With `position="popper"` (shadcn's default) use the full recipe. With `position="item-aligned"`, fade only: Radix measures the list on mount to align the selected item, and there is no origin variable.
- Everything the Content renders goes inside the `motion.div`: Select's scroll buttons and Viewport, an Arrow, etc.
- shadcn's side offset classes (`data-[side=bottom]:translate-y-1`, …) can stay: Tailwind v4 applies them through the CSS `translate` property, which composes with the animated `transform`. With Tailwind v3 they would conflict; move the offset to `sideOffset`.
- Reopening while the exit is still playing mounts a fresh element instead of retargeting the leaving one. That's expected for presence-gated overlays given the short exit. While it exits, Radix still blocks outside clicks for those 150ms; that's acceptable.
- Submenus (Dropdown Menu, Context Menu, Menubar) are opened tens of times a day: fade only, no scale, with `transition.exit` both ways. They read the same `--radix-dropdown-menu-content-transform-origin`. Closing the root menu closes them; both exit together.
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

- Default: `scale(0.96)` and opacity. Enter with `transition.modal` (0.3s), exit with `transition.modalExit` (0.2s): put each transition inside its own target so they differ.
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

Gate: tens of times a day. Purpose: continuity, content below doesn't jump. This is the one place `height` animates.

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

- `transition.disclosure`: 0.2s ease-out. Height only, plus opacity: no slide, no animated mask.
- `AnimatePresence initial={false}`: items open by default don't animate on page load.
- Reduced motion: `height` is skipped by `ReducedMotionConfig` automatically (it jumps); opacity still fades. Wrap the Root.
- Derive each item's open state from the root value; never copy it into state with an effect. With a single-value root the value is a string, so compare with `===`, not `includes` (`'item-10'.includes('item-1')` is true).
- Chevron: `transition-transform duration-200 ease-out-strong`.

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
- Drag to dismiss (Base UI 1.8's Drawer): dismiss on velocity (about 0.11 px/ms), not distance alone.

## Indicator (Tabs, Toggle Group, Navigation Menu, Sidebar active item)

Gate: tens of times a day. Purpose: spatial, the selection moves between items.

- A shared element with `layoutId` (Animate UI's `Highlight` in children mode) and `spring.snappy`: no overshoot, and a spring keeps clicking quickly through tabs smooth because it retargets with its velocity.
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
- Panels: the incoming panel fades in with `transition.fade` (0.15s); the outgoing one unmounts at once. No `AnimatePresence mode="wait"`, no `layout` on the panel, no blur.
- Never follow an item by animating `top`, `left`, `width` or `height`.
- Trigger color: `transition-colors duration-150`.
- `ReducedMotionConfig` around the Root turns the `layoutId` move into a jump.

## Press (Button, Toggle, Checkbox, Switch, Radio)

Gate: tens of times a day. Purpose: feedback. Validated on the Switch; the scale guidance applies to the others.

- Press feedback: `whileTap={{ transform: 'scale(0.97)' }}` (the `scale.press` token) with `transition.press`. No hover scale-up on small controls.
- Switch thumb: `layout` with `spring.snappy`. The thumb moves because the root's justification changes, and `layout` animates that with transforms.
- A size change on press (the iOS-style stretch) is a plain style change animated by `layout`, never a tweened `width`: set `data-pressed` on the thumb and style it (`data-pressed:w-(--switch-pressed-width)`).
- Icons inside a control fade (`transition.fade`), no scale from 0. Use `initial={false}` so they don't animate on mount.
- Track background color: `transition-colors duration-150`.
- Checkbox check: responds on the same frame, no delay.
- When Base UI renders the control as a `<button>`, pass `nativeButton`. Headless UI controls expose their state through a render prop: put `ReducedMotionConfig` outside the primitive so the root's motion element is covered too.
