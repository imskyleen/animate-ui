# Wiring Motion into a base library

`@animate-ui/react` already does this for every primitive it ships: use it when you can, and read this when you wire Motion into a part it doesn't cover (or contribute one).

An exit animation needs the element to stay mounted until the animation ends. Each library unmounts closed content on its own, so the component takes over: it tracks `open` itself, gates rendering with `AnimatePresence`, and asks the library to keep the content mounted.

The examples use these imports:

```tsx
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { getStrictContext } from '@animate-ui/react/utils/strict-context';
import { useControlledState } from '@animate-ui/react/utils/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  spring,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
```

The snippets pass every token through `useTempoTransition()` so `AnimateUIProvider`'s `tempo` applies (`useMotionTokens()` does the same).

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
  transition,
  ...props
}: PopoverContentProps) {
  const reduce = useShouldReduceMotion();
  const pop = useTempoTransition(transition ?? spring.pop);
  // `scale`: Motion writes `transform: none` once it's back to 1.
  const hidden = { opacity: 0, scale: reduce ? 1 : scale.popover };

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
        animate={{ opacity: 1, scale: 1, transition: pop }}
        exit={{ ...hidden, transition: pop }}
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

Tooltip: the same, from `scale.tooltip` (0.7). shadcn's `Tooltip` gives each tooltip its own Provider, so Radix's grouping (`data-state="instant-open"`) never applies: every tooltip plays its entrance, which is what Animate UI's primitives do too.

## 3. Base UI (`@base-ui/react`)

- Gate the Portal with `AnimatePresence` and pass `keepMounted`.
- Library props, `className` and `style` go on the Popup; the `motion.div` in its `render` prop carries only the animation. Base UI merges the Popup's props and children into the rendered element.
- Origin: `var(--transform-origin)`, set by the Positioner.
- When `render` is a `<button>` (Checkbox, Radio, Switch), pass `nativeButton` (default it to `true`): these roots render a `<span>` by default since 1.0.
- Some parts append a visually hidden `<span>` as the last child (Progress, for example). Lay out children with `flex flex-col gap-*` rather than `space-y-*`, which adds margin to every child except the last.

```tsx
function PopoverPopupMotion({ transition, ...props }: PopoverPopupProps) {
  const reduce = useShouldReduceMotion();
  const pop = useTempoTransition(transition ?? spring.pop);
  const hidden = { opacity: 0, scale: reduce ? 1 : scale.popover };

  return (
    <PopoverPrimitive.Popup
      data-slot="popover-popup"
      {...props}
      render={
        <motion.div
          initial={hidden}
          animate={{ opacity: 1, scale: 1, transition: pop }}
          exit={{ ...hidden, transition: pop }}
          style={{ transformOrigin: 'var(--transform-origin)' }}
        />
      }
    />
  );
}
```

Render it inside `<AnimatePresence>{isOpen && <PopoverPrimitive.Portal keepMounted><ReducedMotionConfig><PopoverPrimitive.Positioner>…` with the same inner-component pattern as Radix.

Tooltip and Preview Card: delays live on the Trigger or the Provider, not the Root. Tooltips start from `scale.tooltip` (0.7), preview cards from `scale.popover` (0.8).

## 4. React Aria (`react-aria-components`)

React Aria signals overlays with `isEntering` / `isExiting` render props and `data-entering` / `data-exiting`, and keeps a closing overlay mounted only if it sees running animations at that moment. Motion hasn't started its exit yet then, so:

- Resolve the open state the way React Aria does: the component's own `isOpen` / `defaultOpen`, otherwise the trigger's `OverlayTriggerStateContext` (DialogTrigger, MenuTrigger, Select, ComboBox…).
- Gate the overlay with `AnimatePresence` on that state, and pass `isExiting` while the exit plays so `data-exiting` and the render prop stay correct.
- Render through React Aria's `render` prop (or `motion.create`), so the motion element is React Aria's own element and `className` / `style` functions keep working.
- Origin: the placement React Aria resolves (`data-placement`), or `--trigger-anchor-point` when set.
- Collections (Select, ComboBox) keep a hidden copy of their items while closed: when closed, still render the plain React Aria overlay so the chosen label stays.
- Controls render their indicators yourself (render props): find them by shadcn's `data-slot` attributes and animate them, never fake the render props.

`@animate-ui/react/primitives/react-aria` re-exports all of React Aria with the animated overrides, so one import covers a whole component.

## 5. Plain markup (no base library)

Gate with `AnimatePresence` on your own state. You own focus management and dismissal: for an overlay, prefer adding a base library over hand-rolling one.

## Where `ReducedMotionConfig` goes

Wrap the outermost element the component renders: inside the Portal for overlays, around the Root for in-flow components. One wrapper per component is enough. Components that call `useShouldReduceMotion()` must render inside it, which is why overlays use an inner component.
