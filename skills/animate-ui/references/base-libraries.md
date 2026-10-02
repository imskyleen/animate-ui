# Wiring Motion into a base library

An exit animation needs the element to stay mounted until the animation ends. Each library unmounts closed content on its own, so the component takes over: it tracks `open` itself, gates rendering with `AnimatePresence`, and asks the library to keep the content mounted.

The examples use these imports (adjust the alias to the project's `components.json`):

```tsx
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/lib/motion';
```

`getStrictContext` and `useControlledState` are Animate UI registry items (`@animate-ui/lib-get-strict-context`, `@animate-ui/hooks-use-controlled-state`).

## 1. The Root tracks `open`

Mirror the open state in context so `AnimatePresence` can read it, and give it back to the library as `open` so there's a single source of truth. Default an uncontrolled `defaultOpen` to `false`.

```tsx
type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};
const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>('PopoverContext');

function Popover({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <PopoverProvider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      />
    </PopoverProvider>
  );
}
```

## 2. Radix UI (`radix-ui`)

- Gate the Portal with `AnimatePresence` and pass `forceMount`. Keep the Portal inside the Content component, as shadcn does.
- Put `ReducedMotionConfig` inside the Portal, and render the animated part in an inner component so `useShouldReduceMotion()` runs inside the wrapper.
- `Content` gets `asChild` and `forceMount`, plus every library prop, `className` and `style`. Radix's Slot merges them onto the `motion.div`, which only carries the animation and `children`.
- Origin: `var(--radix-<component>-content-transform-origin)`.

```tsx
type PopoverContentProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  'forceMount' | 'asChild'
> & {
  transition?: Transition;
};

function PopoverContent(props: PopoverContentProps) {
  const { isOpen } = usePopover();
  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal forceMount>
          <ReducedMotionConfig>
            <PopoverContentMotion {...props} />
          </ReducedMotionConfig>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function PopoverContentMotion({
  className,
  children,
  align = 'center',
  sideOffset = 4,
  transition = motionTransition.dropdown,
  ...props
}: PopoverContentProps) {
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <PopoverPrimitive.Content
      asChild
      forceMount
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
        className,
      )}
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{ opacity: 1, transform: 'scale(1)', transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
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

Remove `forceMount` and `asChild` from the public props type since the component owns them. This is the accepted exception to "same props". If the original puts a `data-slot` on the Portal (shadcn does: `data-slot="popover-portal"`), keep it next to `forceMount`.

Tooltip: `TooltipContent` gets `data-state="delayed-open"` or `"instant-open"`, but shadcn's `Tooltip` gives each tooltip its own Provider, so the library never reports "instant". Track warm tooltips yourself (see the Overlay recipe).

## 3. Base UI (`@base-ui/react`)

- Gate the Portal with `AnimatePresence` and pass `keepMounted`.
- Library props, `className` and `style` go on the Popup; the `motion.div` in its `render` prop carries only the animation. Base UI merges the Popup's props and children into the rendered element.
- Origin: `var(--transform-origin)`, set by the Positioner.
- When `render` is a `<button>` (Checkbox, Radio, Switch), pass `nativeButton` (default it to `true`): these roots render a `<span>` by default since 1.0.
- Some parts append a visually hidden `<span>` as the last child (Progress, for example). Lay out children with `flex flex-col gap-*` rather than `space-y-*`, which adds margin to every child except the last.

```tsx
function PopoverPopupMotion({
  transition = motionTransition.dropdown,
  ...props
}: PopoverPopupProps) {
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <PopoverPrimitive.Popup
      data-slot="popover-popup"
      {...props}
      render={
        <motion.div
          initial={hidden}
          animate={{ opacity: 1, transform: 'scale(1)', transition }}
          exit={{ ...hidden, transition: motionTransition.exit }}
          style={{ transformOrigin: 'var(--transform-origin)' }}
        />
      }
    />
  );
}
```

Render it inside `<AnimatePresence>{isOpen && <PopoverPrimitive.Portal keepMounted><ReducedMotionConfig><PopoverPrimitive.Positioner>…` with the same inner-component pattern as Radix.

Tooltip and Preview Card: delays live on the Trigger or the Provider, not the Root. A warm tooltip carries `data-instant`, but as with Radix, per-tooltip Providers hide it: track warm tooltips yourself.

## 4. Headless UI (`@headlessui/react`)

- Gate the panel yourself with `AnimatePresence` and render it `static`, so Headless UI doesn't unmount it.
- Pass `as={motion.div}` and put the motion props on the panel. Headless UI forwards the other props to it.
- Origin: Headless UI sets `data-anchor` (`top_center`, `bottom_start`, …) on anchored panels. Map it to an origin.

```tsx
function PopoverPanelMotion({
  transition = motionTransition.dropdown,
  ...props
}: PopoverPanelProps) {
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <PopoverPanelPrimitive
      static
      as={motion.div}
      data-slot="popover-panel"
      initial={hidden}
      animate={{ opacity: 1, transform: 'scale(1)', transition }}
      exit={{ ...hidden, transition: motionTransition.exit }}
      {...props}
    />
  );
}
```

```txt
data-[anchor=bottom_start]:origin-top-left   data-[anchor=bottom_center]:origin-top   data-[anchor=bottom_end]:origin-top-right
data-[anchor=top_start]:origin-bottom-left   data-[anchor=top_center]:origin-bottom   data-[anchor=top_end]:origin-bottom-right
data-[anchor=left_*]:origin-right            data-[anchor=right_*]:origin-left
```

A Headless UI `Dialog` root renders its children: wrap them in `ReducedMotionConfig` through its render-prop child so function children keep working.

## 5. Plain markup (no base library)

Gate with `AnimatePresence` on your own state. You own focus management and dismissal: for an overlay, prefer adding a base library over hand-rolling one.

## Where `ReducedMotionConfig` goes

Wrap the outermost element the component renders: inside the Portal for overlays, around the Root for in-flow components. One wrapper per component is enough. Components that call `useShouldReduceMotion()` must render inside it, which is why overlays use an inner component.
