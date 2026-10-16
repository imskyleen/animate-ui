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
  transition as motionTransition,
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
- Menubar: Radix keeps which menu is open private. Mirror the Root's `value` (controlled or not) in context so each Content knows when it closes and can play its exit. Radix switches from one menu to the next in one commit; the Root also provides the menubar's handoff group, so the next menu takes the popover over (Menu recipe, internal/menu-handoff.ts).

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

Tooltip: the same, from `scale.tooltip` (0.7). shadcn's `Tooltip` gives each tooltip its own Provider, so Radix's grouping (`data-state="instant-open"`) never applies: track the warm-up yourself (see `recipes/overlay.md`).

## 3. Base UI (`@base-ui/react`)

- Gate the Portal with `AnimatePresence` and pass `keepMounted`.
- Library props, `className` and `style` go on the Popup; the `motion.div` in its `render` prop carries only the animation. Base UI merges the Popup's props and children into the rendered element.
- Origin: `var(--transform-origin)`, set by the Positioner.
- When `render` is a `<button>` (Checkbox, Radio, Switch), pass `nativeButton` (default it to `true`): these roots render a `<span>` by default since 1.0.
- Progress and Slider format their numbers (value text, `aria-valuetext`) with `Intl.NumberFormat` in the runtime's locale when no `locale` is given: the server's on the server, the browser's in the browser, so a browser in another language hydrates a mismatch ("13%" against "13 %"; a text one makes React drop the server's HTML and render it again, reported as an uncaught error rather than in the console). Wrap their Root and pass `locale={useHydrationLocale(props.locale)}` (internal/hydration-locale.ts): en-US on the server and while hydrating, then the browser's, like React Aria.
- Some parts append a visually hidden `<span>` as the last child (Progress, for example). Lay out children with `flex flex-col gap-*` rather than `space-y-*`, which adds margin to every child except the last.
- Menubar: Base UI's `Menubar` only lays out its menus. Wrap it (same props, keeping its `Menubar.Props`/`Menubar.State` type namespace) to provide the handoff group (Menu recipe, internal/menu-handoff.ts), read it in each `Menu.Root` and reset it for everything nested (submenus' and context menus' popups open on their own). On hover, Base UI opens the next menu before it closes the previous one (`sibling-open`); on ArrowLeft it closes the open one first (`list-navigation`), then opens the previous trigger's: keep the reason from `onOpenChange` so a menu closed that way can still hand its popover over while it's shown.

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

Tooltip and Preview Card: delays live on the Trigger or the Provider, not the Root. Tooltips start from `scale.tooltip` (0.7), preview cards from `scale.popover` (0.8). A warm tooltip carries `data-instant`, but per-tooltip Providers hide it too: track the warm-up yourself.

## 4. React Aria (`react-aria-components`)

React Aria signals overlays with `isEntering` / `isExiting` render props and `data-entering` / `data-exiting`, and keeps a closing overlay mounted only if it sees running animations at that moment. Motion hasn't started its exit yet then, so:

- Resolve the open state the way React Aria does: the component's own `isOpen` / `defaultOpen`, otherwise the trigger's `OverlayTriggerStateContext` (DialogTrigger, MenuTrigger, Select, ComboBox…).
- Gate the overlay with `AnimatePresence` on that state, and pass `isExiting` while the exit plays so `data-exiting` and the render prop stay correct.
- Render through React Aria's `render` prop (or `motion.create`), so the motion element is React Aria's own element and `className` / `style` functions keep working.
- Origin: the placement React Aria resolves (`data-placement`), or `--trigger-anchor-point` when set.
- Collections (Select, ComboBox) keep a hidden copy of their items while closed: when closed, still render the plain React Aria overlay so the chosen label stays.
- Controls render their indicators yourself (render props): find them by shadcn's `data-slot` attributes and animate them, never fake the render props.
- A menu's clip must meet its submenu's for the highlight to cross between them: shadcn-style React Aria menus pad the `Popover` and clip in the inner `Menu` (flush with the items), leaving a gap of the padding on each side. Animate UI's `Menu` reaches into its popover's padding (negative margin, as much padding) so it clips at the popover's padding box, like Radix UI's and Base UI's content.
- Collection items (`ListBoxItem`, `MenuItem`) are rendered by React Aria from the props they gave the collection: hooks in your wrapper don't run around the real element. Pass a `render` function and do the work in a component it renders (the highlight follows the item marked `data-focused`, read through a ref merged with React Aria's). A `SelectValue` renders the chosen item's children again outside the list: anything list-bound inside them (a `SelectionIndicator`) must render nothing there.

`@animate-ui/react/primitives/react-aria` re-exports all of React Aria with the animated overrides, so one import covers a whole component.

## 5. Plain markup (no base library)

Gate with `AnimatePresence` on your own state: render the element conditionally inside it, never return `null` before it (an early return skips the exit). The component keeps its own focus management and dismissal; animating it doesn't move it onto a library (SKILL.md, C), though the output may say what one would add.

```tsx
'use client';

export function Panel({ open }: { open: boolean }) {
  return (
    <ReducedMotionConfig>
      <AnimatePresence>{open && <PanelBody key="panel" />}</AnimatePresence>
    </ReducedMotionConfig>
  );
}

function PanelBody() {
  const reduce = useShouldReduceMotion(); // inside the wrapper
  const enter = useTempoTransition(motionTransition.sheet);
  const leave = useTempoTransition(motionTransition.dismiss);
  const hidden = {
    opacity: 0,
    transform: reduce ? 'translateX(0%)' : 'translateX(100%)',
  };
  return (
    <motion.aside
      initial={hidden}
      animate={{ opacity: 1, transform: 'translateX(0%)', transition: enter }}
      exit={{ ...hidden, transition: leave }}
    />
  );
}
```

A hand-built component has no `transition` / `exitTransition` props unless you want them: the recipes' `transition ?? …` is how Animate UI's primitives take them, so use the token directly.

## Where `ReducedMotionConfig` goes

Wrap the outermost element the component renders: inside the Portal for overlays, around the Root for in-flow components, around `AnimatePresence` for plain markup. One wrapper per component is enough. Components that call `useShouldReduceMotion()` must render inside it, which is why overlays use an inner component.
