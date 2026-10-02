# Wiring Motion into a base library

An exit animation needs the element to stay mounted until the animation ends. Each library unmounts closed content on its own, so the primitive takes over: it tracks `open` itself, gates rendering with `AnimatePresence`, and asks the library to keep the content mounted.

All three patterns share the same first step: mirror the open state in context so `AnimatePresence` can read it.

```tsx
const [PopoverProvider, usePopover] = getStrictContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>('PopoverContext');

function Popover(props: PopoverProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  return (
    <PopoverProvider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root {...props} onOpenChange={setIsOpen} />
    </PopoverProvider>
  );
}
```

`getStrictContext` and `useControlledState` are Animate UI registry items (`@animate-ui/lib-get-strict-context`, `@animate-ui/hooks-use-controlled-state`).

## Radix UI (`radix-ui`)

- Gate the Portal with `AnimatePresence` and pass `forceMount`.
- Render the content with `asChild` and `forceMount`, around a `motion.div`. Radix forwards its props, refs and `data-state` to it.
- Origin: `var(--radix-<component>-content-transform-origin)`.

```tsx
function PopoverPortal(props: PopoverPortalProps) {
  const { isOpen } = usePopover();
  return (
    <AnimatePresence>
      {isOpen && <PopoverPrimitive.Portal forceMount {...props} />}
    </AnimatePresence>
  );
}

function PopoverContent({
  transition: contentTransition = transition.dropdown,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Content asChild forceMount>
      <motion.div
        data-slot="popover-content"
        initial={{ opacity: 0, transform: `scale(${scale.enter})` }}
        animate={{ opacity: 1, transform: 'scale(1)' }}
        exit={{ opacity: 0, transform: `scale(${scale.enter})` }}
        transition={contentTransition}
        style={{
          transformOrigin: 'var(--radix-popover-content-transform-origin)',
        }}
        {...props}
      />
    </PopoverPrimitive.Content>
  );
}
```

Remove `forceMount` and `asChild` from the public props type (`Omit<…, 'forceMount' | 'asChild'>`) since the primitive owns them.

Tooltip: `TooltipContent` gets `data-state="delayed-open"` or `"instant-open"`. Skip the entrance when it's `instant-open` (rule 11).

## Base UI (`@base-ui/react`)

- Gate the Portal with `AnimatePresence` and pass `keepMounted`.
- Put the `motion.div` in the Popup's `render` prop.
- Origin: `var(--transform-origin)`, set by the Positioner.
- When `render` is a `<button>` (Checkbox, Radio, Switch), pass `nativeButton` (default it to `true`): these roots render a `<span>` by default since 1.0.
- Some parts append a visually hidden `<span>` as the last child (Progress, for example). Lay out children with `flex flex-col gap-*` rather than `space-y-*`, which adds margin to every child except the last.

```tsx
function PopoverPortal(props: PopoverPortalProps) {
  const { isOpen } = usePopover();
  return (
    <AnimatePresence>
      {isOpen && <PopoverPrimitive.Portal keepMounted {...props} />}
    </AnimatePresence>
  );
}

function PopoverPopup({
  transition: popupTransition = transition.dropdown,
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPrimitive.Popup
      render={
        <motion.div
          data-slot="popover-popup"
          initial={{ opacity: 0, transform: `scale(${scale.enter})` }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          exit={{ opacity: 0, transform: `scale(${scale.enter})` }}
          transition={popupTransition}
          style={{ transformOrigin: 'var(--transform-origin)' }}
          {...props}
        />
      }
    />
  );
}
```

Tooltip and Preview Card: delays live on the Trigger or the Provider, not the Root. A warm tooltip carries `data-instant`.

## Headless UI (`@headlessui/react`)

- Gate the panel yourself with `AnimatePresence` and render it `static`, so Headless UI doesn't unmount it.
- Pass `as={motion.div}` and put the motion props on the panel.
- Origin: Headless UI sets `data-anchor` (`top_center`, `bottom_start`, …) on anchored panels. Map it to an origin.

```tsx
function PopoverPanel({
  transition: panelTransition = transition.dropdown,
  ...props
}: PopoverPanelProps) {
  const { isOpen } = usePopover();
  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPanelPrimitive
          static
          as={motion.div}
          data-slot="popover-panel"
          initial={{ opacity: 0, transform: `scale(${scale.enter})` }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          exit={{ opacity: 0, transform: `scale(${scale.enter})` }}
          transition={panelTransition}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}
```

```txt
data-[anchor=bottom_start]:origin-top-left   data-[anchor=bottom_center]:origin-top   data-[anchor=bottom_end]:origin-top-right
data-[anchor=top_start]:origin-bottom-left   data-[anchor=top_center]:origin-bottom   data-[anchor=top_end]:origin-bottom-right
data-[anchor=left_*]:origin-right            data-[anchor=right_*]:origin-left
```

## Plain markup (no base library)

Gate with `AnimatePresence` on your own state. You own focus management and dismissal: for an overlay, prefer adding a base library over hand-rolling one.

## Where `ReducedMotionConfig` goes

Wrap the outermost element the primitive renders: the Portal's children for overlays, the Root for in-flow components. One wrapper per component is enough.
