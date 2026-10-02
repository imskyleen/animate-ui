---
name: animate-ui
description: Turn any React component (shadcn/ui, Radix UI, Base UI, Headless UI, or plain markup) into an animated component that follows Animate UI's motion rules, using Motion (motion/react). Decides whether it should animate at all, then applies the right pattern for the component type and base library, Animate UI's shared motion tokens, reduced-motion support and trigger-anchored origins. Use when asked to animate a component, add enter/exit or press animations, make a shadcn component "animated", port a component to Animate UI, or review whether a component's motion follows Animate UI's rules.
---

# Animate UI

Turns a static component into an animated one that would ship in the Animate UI registry. The motion philosophy is Emil Kowalski's (see NOTICE.md); this skill adds what it doesn't cover: how to wire Motion into Radix, Base UI and Headless UI primitives, and Animate UI's shared tokens.

## Hard rules

1. **Decide before you animate.** Run the gate in step 1. Writing zero motion code is a valid outcome.
2. **Values come from the tokens**, never from memory: `references/tokens.md`. No hand-typed `stiffness`/`damping`, no `easeInOut` on an entrance.
3. **Keep the component's API.** A shadcn component stays a drop-in replacement: same exports, same props, same `data-slot` attributes. Motion props are additive.
4. **Reduced motion ships with the animation.** Wrap the motion tree in `ReducedMotionConfig`.
5. **Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, `margin` or `padding`, except the documented height technique for disclosures (`references/recipes.md`).

## Workflow

### 1. Gate: should it animate?

| How often it's used                                                                                               | Decision                                     |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 100+ times a day, or triggered from the keyboard (shortcuts, command palette toggle, menu navigation with arrows) | No animation                                 |
| Tens of times a day (tabs, toggles, checkboxes, hover states, tooltips)                                           | Fast and subtle only: under 200ms, no bounce |
| Occasional (dialogs, popovers, dropdowns, sheets, toasts)                                                         | Standard animation                           |
| Rare (onboarding, success, celebration)                                                                           | Expressive motion allowed                    |

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

### 3. Wire it to the base library

Each library keeps content mounted during the exit animation differently. Read the section for the component's library in `references/base-libraries.md`. The short version:

- **Radix UI:** mirror `open` in context, render `<AnimatePresence>{open && <Portal forceMount>…}`, then `<Content asChild forceMount>` around a `motion.div`.
- **Base UI:** same presence gating with `keepMounted` on the Portal, and `render={<motion.div … />}` on the Popup.
- **Headless UI:** `<AnimatePresence>{open && <Panel static as={motion.div} …/>}`.

Set `transform-origin` from the library in the primitive itself, so the primitive is correct even without the styled layer.

### 4. Apply tokens and rules

Import from Animate UI's motion lib (`@animate-ui/lib-motion`, installed at `@/lib/motion`). If the project doesn't use the registry, copy the values from `references/tokens.md` into one local file; never scatter them.

Check every rule in `references/rules.md`. The ones that matter most:

- Enter from `scale.enter` (0.96) plus `opacity: 0`. Never `scale(0)`.
- Ease-out (`ease.out`) for entering and exiting; durations from the `duration` tokens.
- Exits are faster than entrances.
- Write the full `transform` string on the animated element, not `x`/`y`/`scale` shorthands.
- Hover effects only on hover-capable pointers.
- Anything looping pauses off screen and stops under reduced motion.

### 5. Verify

- Run through the checklist at the end of `references/rules.md`.
- Toggle the OS "reduce motion" setting (or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): elements still appear and disappear, nothing moves or scales.
- Trigger it twice quickly: the animation retargets from where it is instead of restarting.
- Check it in slow motion (browser DevTools > Animations at 10%) for origin and overshoot.

## Output

Write the code. Then in a few lines: the gate result (tier and purpose), the recipe used, and any rule you deliberately broke and why.
