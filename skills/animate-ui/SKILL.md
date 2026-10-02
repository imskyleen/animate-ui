---
name: animate-ui
description: Turn any React component (shadcn/ui, Radix UI, Base UI, Headless UI, or plain markup) into an animated component that follows Animate UI's motion rules, using Motion (motion/react). Decides whether it should animate at all, then applies the right pattern for the component type and base library, Animate UI's shared motion tokens, reduced-motion support and trigger-anchored origins. Use when asked to animate a component, add enter/exit or press animations, make a shadcn component "animated", port a component to Animate UI, or review whether a component's motion follows Animate UI's rules.
---

# Animate UI

Turns a static component into an animated one that would ship in the Animate UI registry. The motion philosophy is Emil Kowalski's (see NOTICE.md); this skill adds what it doesn't cover: how to wire Motion into Radix, Base UI and Headless UI primitives, and Animate UI's shared tokens.

## Hard rules

1. **Decide before you animate.** Run the gate in step 1. Writing zero motion code is a valid outcome.
2. **Values come from the tokens**, never from memory: `references/tokens.md`. No hand-typed `stiffness`/`damping`, no `easeInOut` on an entrance. A deliberately instant change uses `transition.instant`.
3. **Keep the component's API.** A shadcn component stays a drop-in replacement: same exports, same props, same `data-slot` attributes. You may add optional props (`transition`). Library props still reach the library.
4. **Reduced motion ships with the animation.** Wrap the motion tree in `ReducedMotionConfig`, and neutralize `transform` strings with `useShouldReduceMotion()` (Motion's setting doesn't cover them).
5. **Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, `margin` or `padding`, except the documented height technique for disclosures (`references/recipes.md`).

## Workflow

### 1. Gate: should it animate?

| How often it's used                                                 | Decision                                                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 100+ times a day                                                    | No animation                                                                       |
| Tens of times a day (tabs, toggles, checkboxes, tooltips, submenus) | Fast and subtle only: under 200ms, no bounce, fade rather than scale when in doubt |
| Occasional (dialogs, popovers, dropdowns, sheets, toasts)           | Standard animation                                                                 |
| Rare (onboarding, success, celebration)                             | Expressive motion allowed                                                          |

**Keyboard:** never animate a global keyboard shortcut (command palette toggle, app hotkeys) or keyboard navigation (arrow keys moving a highlight between items). Opening an overlay animates the same way whatever the input; don't track input modality for it.

Name the purpose in one word: feedback, spatial (where it came from), state, continuity (avoids a jump) or delight (rare tier only). If you can't name one, don't animate.

### 2. Classify the component

| Kind             | Examples                                                                    | Recipe     |
| ---------------- | --------------------------------------------------------------------------- | ---------- |
| Anchored overlay | Popover, Tooltip, Dropdown Menu, Context Menu, Hover Card, Select, Combobox | Overlay    |
| Centered overlay | Dialog, Alert Dialog                                                        | Modal      |
| Edge overlay     | Sheet, Drawer                                                               | Sheet      |
| Disclosure       | Accordion, Collapsible                                                      | Disclosure |
| Moving indicator | Tabs, Toggle Group, Navigation Menu, Sidebar active item                    | Indicator  |
| Pressable        | Button, Toggle, Checkbox, Switch, Radio                                     | Press      |

Load `references/recipes.md` and start from the matching recipe.

### 3. Convert the existing component

When starting from a shadcn component (or any component with CSS animations):

- **Remove its CSS animation classes:** `data-[state=*]:animate-in`, `animate-out`, `fade-*`, `zoom-*`, `slide-in-from-*`, `slide-out-to-*`, and `origin-(--…)`. Left in place they run on top of Motion. The origin moves into the primitive's `style`.
- **Keep its structure.** shadcn renders the Portal inside `PopoverContent`, `DropdownMenuContent`, etc.: keep it there. An exported `*Portal` stays a plain passthrough.
- **Split props.** Library props (`align`, `sideOffset`, focus and dismiss callbacks), `className` and `style` stay on the library part (`Content` with `asChild`, or Base UI's `Popup`). The `motion.div` carries only the motion props and `children`. Spreading the user's props onto the `motion.div` silently breaks positioning.

### 4. Wire it to the base library

Each library keeps content mounted during the exit animation differently. Read the section for the component's library in `references/base-libraries.md`. The short version:

- **Radix UI:** the Root tracks `open` (`useControlledState`, passed back as `open`), content renders inside `<AnimatePresence>{open && <Portal forceMount>…}`, then `<Content asChild forceMount>` around a `motion.div`.
- **Base UI:** same presence gating with `keepMounted` on the Portal, and `render={<motion.div … />}` on the Popup.
- **Headless UI:** `<AnimatePresence>{open && <Panel static as={motion.div} …/>}`.

Set `transform-origin` from the library in the primitive itself, so the primitive is correct even without the styled layer.

### 5. Apply tokens and rules

Import from Animate UI's motion lib. The registry item is `@animate-ui/lib-motion`; it installs to the project's `lib` alias (`@/lib/motion` in a default shadcn app). The helpers `getStrictContext` and `useControlledState` install to the `lib` and `hooks` aliases the same way. Check `components.json` for the actual paths before importing. Import its `transition` export as `motionTransition`, since components also take a `transition` prop. If the project doesn't use the registry, copy the values from `references/tokens.md` into one local file; never scatter them.

Check every rule in `references/rules.md`. The ones that matter most:

- Enter from `scale.enter` (0.96) plus `opacity: 0`. Never `scale(0)`.
- Ease-out (`ease.out`) for entering and exiting; durations from the `duration` tokens.
- Exits are never slower than entrances: overlays close with `transition.exit`, modals with `transition.modalExit`.
- Write the full `transform` string on the animated element, not `x`/`y`/`scale` shorthands.
- Hover effects only on hover-capable pointers.
- Anything looping pauses off screen and stops under reduced motion.

### 6. Verify

- Run through the checklist at the end of `references/rules.md`.
- Toggle the OS "reduce motion" setting (or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): elements still appear and disappear, nothing moves or scales.
- Trigger it twice quickly: the animation retargets from where it is instead of restarting.
- Check positioning still works (`side`, `align`, `sideOffset`) and the user's `className` still applies.
- Check it in slow motion (browser DevTools > Animations at 10%) for origin and overshoot.

## Output

Write the code. Then in a few lines: the gate result (tier and purpose), the recipe used, and any rule you deliberately broke and why.
