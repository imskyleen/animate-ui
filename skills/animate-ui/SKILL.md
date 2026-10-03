---
name: animate-ui
description: Turn any React component (shadcn/ui, Radix UI, Base UI, Headless UI, or plain markup) into an animated component that follows Animate UI's motion rules, using Motion (motion/react). Decides whether it should animate at all, then applies the right pattern for the component type and base library, Animate UI's shared motion tokens, reduced-motion support and trigger-anchored origins. Use when asked to animate a component, add enter/exit or press animations, make a shadcn component "animated", port a component to Animate UI, or review whether a component's motion follows Animate UI's rules.
---

# Animate UI

Turns a static component into an animated one that would ship in the Animate UI registry. The motion philosophy is based on Emil Kowalski's (see NOTICE.md), with one deliberate departure: Animate UI's timing is more permissive than his budgets. Strong ease-out stays the default curve and durations run a bit longer so the motion reads, but nothing used dozens of times a day is ever slow. This skill also adds how to wire Motion into Radix, Base UI and Headless UI primitives, and Animate UI's shared tokens.

`references/rules.md` splits the rules in two families: **quality rules** (correctness, accessibility, performance: breaking one is a bug) and **style rules** (curves, durations, scale, bounce: Animate UI's defaults, customizable).

## Hard rules

1. **Decide before you animate.** Run the gate in step 1. Writing zero motion code is a valid outcome.
2. **Values come from the tokens**, never from memory: `references/tokens.md`. No hand-typed `stiffness`/`damping`, no `easeInOut` on an entrance. A deliberately instant change uses `transition.instant`. The global pace is `tempo`, not per-component tweaks.
3. **Keep the component's API.** A shadcn component stays a drop-in replacement: same exports, same props, same `data-slot` attributes. You may add optional props (`transition`). Library props still reach the library.
4. **Reduced motion ships with the animation.** With Motion: wrap the motion tree in `ReducedMotionConfig`, and neutralize `transform` strings with `useShouldReduceMotion()` (Motion's setting doesn't cover them). With CSS: zero the travel under `motion-reduce:` (CSS recipe).
5. **Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, `margin` or `padding`, except the documented height technique for disclosures (`references/recipes.md`).

## Workflow

### 1. Gate: should it animate?

| How often it's used                                                                            | Decision                                                                    |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 100+ times a day (command palette, keyboard shortcuts, arrow-key highlight)                    | No animation (quality rule)                                                 |
| Used constantly, dozens of times a day (tooltips, press, tabs indicator, highlight, toggles)  | Up to 250ms; springs up to ~0.4s visual, bounce ≤ 0.15; fade when in doubt  |
| Occasional (popovers, dropdowns, selects, hover cards / dialogs, sheets, drawers, toasts)      | Overlays 200 to 400ms; modals and sheets 300 to 600ms                       |
| Rare (icons, effects, text, onboarding, success, delight)                                      | Expressive: 300 to 800ms, bounce up to 0.3                                  |

**Keyboard (quality rule):** never animate a global keyboard shortcut (command palette toggle, app hotkeys) or keyboard navigation (arrow keys moving a highlight between items). Opening an overlay animates the same way whatever the input; don't track input modality for it.

Name the purpose in one word: feedback, spatial (where it came from), state, continuity (avoids a jump) or delight (rare tier only). If you can't name one, don't animate.

### 2. Classify the component

| Kind                 | Examples                                                                    | Recipe                                               |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| Anchored overlay     | Popover, Tooltip, Dropdown Menu, Context Menu, Hover Card, Select, Combobox | Overlay                                              |
| Centered overlay     | Dialog, Alert Dialog                                                        | Modal                                                |
| Edge overlay         | Sheet, Drawer                                                               | Sheet (Base UI Drawer: CSS-driven)                   |
| Stacked notification | Toast                                                                       | CSS-driven (Base UI Toast); Sonner already does this |
| Disclosure           | Accordion, Collapsible                                                      | Disclosure                                           |
| Moving indicator     | Tabs, Toggle Group, Navigation Menu, Sidebar active item                    | Indicator                                            |
| Pressable            | Button, Toggle, Checkbox, Switch, Radio                                     | Press                                                |

Load `references/recipes.md` and start from the matching recipe.

**Motion or CSS?** When the base library owns a gesture or a stack and exposes it as CSS variables plus `data-starting-style`/`data-ending-style` (Base UI Drawer and Toast), animate with CSS transitions that read those variables, not Motion: layering Motion on top fights the gesture. Everything else uses Motion.

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

Quality (non-negotiable):

- Never `scale(0)`; anchored overlays take their origin from the trigger, modals stay centered.
- Exits are faster than entrances: overlays close with `transition.exit`, modals with `transition.modalExit`, sheets with `transition.drawerExit`.
- Write the full `transform` string on the animated element, not `x`/`y`/`scale` shorthands. No `transition-all`.
- Hover effects only on hover-capable pointers. Re-triggering retargets, never restarts.
- Anything looping pauses off screen and stops under reduced motion.

Style (defaults):

- Strong ease-out (`ease.out`) for entering and exiting; `ease.inOut` only for on-screen movement.
- Durations from the `duration` tokens (tooltip 0.2s, dropdown 0.3s, modal 0.4s, drawer 0.5s). Longer than Emil's on purpose: the curve front-loads the motion so the response is immediate. Nothing slow on things used dozens of times a day.
- Enter from `scale.enter` (0.95) plus `opacity: 0`; press at `scale.press` (0.96).

### 6. Verify

- Run through the checklist at the end of `references/rules.md`: every quality item must pass; style deviations are named in the output.
- Toggle the OS "reduce motion" setting (or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): elements still appear and disappear, nothing moves or scales.
- Trigger it twice quickly: the animation retargets from where it is instead of restarting.
- Check positioning still works (`side`, `align`, `sideOffset`) and the user's `className` still applies.
- Check it in slow motion (browser DevTools > Animations at 10%) for origin and overshoot.

## Output

Write the code. Then in a few lines: the gate result (tier and purpose), the recipe used, and any style default you deliberately changed and why. Quality rules are not broken.
