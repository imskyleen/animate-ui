---
name: animate-ui
description: Animate React components with Animate UI (Motion-based animated primitives for Radix UI, Base UI and React Aria). For shadcn/ui components, runs the `@animate-ui/cli` codemod that swaps their primitives for Animate UI's; for components built directly on Radix UI, Base UI or React Aria, swaps the import to `@animate-ui/react`; for anything else (custom components, plain markup, other libraries), applies Animate UI's motion rules, tokens (springs, curves, scales, blur) and recipes with Motion (motion/react). Also migrates Animate UI v1 projects. Use when asked to animate a component, make shadcn/ui "animated", add enter/exit, press or swap animations, set up Animate UI, change the animation pace, or review whether motion follows Animate UI's rules.
---

# Animate UI

Animate UI animates the primitives components are built on. Its package, `@animate-ui/react`, ships each Radix UI, Base UI and React Aria primitive with **exactly its library's API** and Motion inside, so swapping the import is the whole change.

Its motion is springy and alive, but coherent: nearly everything moves on a spring, each motion role has one value (the tokens), and tweens pick their curve by what the element does. It borrows Emil Kowalski's practical rules (trigger-anchored origins, ease-out for what enters and leaves, press feedback, a light blur to bridge swaps; see NOTICE.md) without his strictness: springs may overshoot a little, popups can start from 0.7, and the keyboard animates like the pointer.

## 1. Pick the path

| The component is…                                                              | Do this                          |
| ------------------------------------------------------------------------------ | -------------------------------- |
| A shadcn/ui component (the project has `components.json`)                      | **A. Run the CLI**               |
| Hand-built on Radix UI, Base UI or React Aria                                  | **B. Swap the import**           |
| Custom, plain markup, another library, or a primitive Animate UI doesn't cover | **C. Animate it with the rules** |
| An Animate UI v1 project (`components/animate-ui/...` files)                   | **D. Migrate**                   |

Whatever the path, run the gate first (§ Gate): writing zero motion code is a valid outcome.

## A. shadcn/ui components: run the CLI

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest animate <component> --dry-run   # preview
pnpm dlx @animate-ui/cli@latest animate <component>             # or: animate all
```

The CLI finds the components through `components.json`, swaps their primitive imports (`radix-ui`, `@radix-ui/react-*`, `@base-ui/react[/…]`, `react-aria-components`, `vaul`) for `@animate-ui/react`, and removes the CSS animation classes Motion replaces (tw-animate utilities, Base UI `data-starting-style`/`data-ending-style` transitions, React Aria `data-entering`/`data-exiting`, CSS-variable heights). It works for every shadcn base and style, is idempotent, and lists primitives it doesn't animate yet. Don't hand-edit what the CLI does; if its output looks wrong, report it.

## B. Built on Radix UI, Base UI or React Aria: swap the import

```tsx
import { Dialog, Slot } from 'radix-ui'; // before
import { Dialog, Slot } from '@animate-ui/react/primitives/radix-ui'; // after (re-exports all of radix-ui)
import * as DialogPrimitive from '@radix-ui/react-dialog'; // before
import * as DialogPrimitive from '@animate-ui/react/primitives/radix-ui/dialog'; // after
import { Dialog } from '@base-ui/react/dialog'; // before
import { Dialog } from '@animate-ui/react/primitives/base-ui/dialog'; // after
import { Dialog, Field } from '@base-ui/react'; // before
import { Dialog, Field } from '@animate-ui/react/primitives/base-ui'; // after (re-exports all of Base UI)
import { Popover, Button } from 'react-aria-components'; // before
import { Popover, Button } from '@animate-ui/react/primitives/react-aria'; // after (re-exports all of React Aria)
```

Mirror the library's import style: an umbrella import (`radix-ui`, `@base-ui/react`, `react-aria-components`) keeps its specifiers and only changes source; a per-package or subpath import (`@radix-ui/react-*`, `@base-ui/react/*`, `vaul` → `radix-ui/drawer`, `input-otp`) uses the per-primitive path.

Then remove the component's own CSS animation classes (same list as the CLI) so they don't run on top of Motion. Everything else stays: parts, props, data attributes, `forceMount`/`keepMounted`, render props. Animated parts accept two optional props, `transition` and `exitTransition` (Motion `Transition`s). To change the pace of every animation at once, wrap the app in `<AnimateUIProvider tempo={1.2}>` (`@animate-ui/react/provider`); without it the defaults apply.

## C. Anything else: animate it with the rules

1. **Gate** (below), then classify the component and start from the matching recipe in `references/recipes.md`.
2. If it renders a Radix UI, Base UI or React Aria overlay, prefer composing Animate UI's primitive over re-wiring presence yourself. Otherwise wire Motion into the library as `references/base-libraries.md` shows.
3. Take every value from the tokens (`references/tokens.md`): `import { spring, transition, scale, blur, ease, useTempoTransition, ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/react/utils/motion'`. Pass them through `useTempoTransition()` (or read them from `useMotionTokens()`) so `AnimateUIProvider`'s `tempo` applies. No hand-typed spring for a role a token covers, no ease-in (but a dismissed dialog's `transition.dismiss`), no ease-in-out on an entrance.
4. Check every rule in `references/rules.md` (quality rules are non-negotiable; style rules are defaults), then verify (§ Verify).

### Gate: should it animate?

| How often it's used                                                    | Decision                                                                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constantly (press, tooltips, menus, tabs, toggles, hover highlights)   | Animate, quickly: `spring.press`, `transition.menu`, `spring.pop`, `spring.selection`, `spring.highlight`; no hover scale                                                 |
| Occasionally (popovers, selects, dialogs, sheets, toasts, disclosures) | The role's token: surfaces may take their time (`spring.dialog`, `transition.drawer` and `transition.sheet` in, `transition.dismiss` out, `spring.toast` for edge toasts) |
| Rarely (effects, text, numbers, icons, onboarding, success)            | Expressive: their own springs, more bounce, longer rhythms                                                                                                                |
| Toggled from the keyboard all day (command palette, global shortcuts)  | Consider no animation                                                                                                                                                     |

Keyboard navigation animates like the pointer. Name the purpose in one word (feedback, spatial, state, continuity, delight); if you can't, don't animate.

### Kinds of component

| Kind                                                                           | Examples                                                                | Recipe     |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------- |
| Anchored overlay                                                               | Popover, Tooltip, Hover Card, Preview Card                              | Overlay    |
| Anchored list                                                                  | Dropdown Menu, Context Menu, Menubar, Select, Combobox, Navigation Menu | Menu       |
| Centered overlay                                                               | Dialog, Alert Dialog                                                    | Modal      |
| Edge overlay                                                                   | Sheet, Drawer                                                           | Sheet      |
| Disclosure                                                                     | Accordion, Collapsible                                                  | Disclosure |
| Moving indicator                                                               | Tabs, Toggle Group, Navigation Menu indicator                           | Indicator  |
| Pressable                                                                      | Button, Toggle, Checkbox, Switch, Radio                                 | Press      |
| Two states swapping in place                                                   | Copy → copied, sun → moon, a changing label                             | Swap       |
| Gesture or stack the library drives with CSS variables (Base UI Drawer, Toast) |                                                                         | CSS-driven |

### The rules in short

- Reduced motion ships with the animation: `ReducedMotionConfig` around the motion tree, `useShouldReduceMotion()` to neutralize `transform` strings, `<ReducedMotionConfig remount>` for animations that play on mount. Fades and blurs stay, movement goes.
- Transform, opacity and filter (height only where content must push what's below). Anchored popups grow from their trigger (library origin variables), from 0.7 / 0.8 / 0.9 by kind; modals stay centered.
- Press scales to 0.95 on a spring; nothing scales on hover.
- Tweens: ease-out for what enters and leaves, a softer ease-out for what the eye watches change (disclosures unfolding, menus opening, sheets sliding in), ease-in-out for what moves on screen, `ease` for color and for an overlay dimming the whole page (gentle at first and at last, its blur grown as it's seen); never ease-in: a dismissed dialog, drawer or sheet speeds away on a steady push (`transition.dismiss`). A light blur bridges a swap.
- The exit replays the entrance (a dismissed dialog, drawer or sheet leaves at once, quicker, speeding away), its transition inside the `exit` target (an exiting element keeps its last props). Open from the start, it still animates.
- Keep the library element as the animated element (Radix `asChild`, Base UI `render`, React Aria `render`/`motion.create`) so `data-*` attributes and styles still apply.
- Warm tooltips show at once (and the one they replace goes at once).
- The keyboard animates like the pointer; hover only on hover-capable fine pointers; re-triggering retargets, never restarts; loops pause off screen.

## D. Animate UI v1 projects: migrate

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest migrate all --dry-run
pnpm dlx @animate-ui/cli@latest migrate all
```

It rewrites imports of the copied v1 primitives, icon core and libs to `@animate-ui/react`, maps v1 export names to the v2 parts, and lists manual steps (v1-only props, Headless UI primitives, which v2 doesn't support). The migration is partial where it must be: in an import mixing mappable parts with v1-only ones (`DropdownMenuHighlight`, context hooks like `useAccordionItem`), the mappable parts move to v2 and the v1-only names stay imported from the v1 file, each with a manual step. Those read v1's context, so they throw at runtime once their parent is v2: remove them (v2 parts animate themselves; use `data-state` attributes or controlled state), or replace the component with shadcn/ui's + `animate-ui animate`.

At the end it lists the v1 files `@animate-ui/react` replaces that nothing imports anymore (and the ones still imported, by what). In a terminal it asks about each one (delete it, delete it and all the others, keep it, keep them all); `--delete` deletes them all and `--keep` keeps them all without asking. Non-interactive runs (CI, an agent's shell) keep them: pass `--delete` once the manual steps are done.

## Verify

- Every quality item of the checklist in `references/rules.md` passes; style deviations are named.
- Reduced motion (OS setting or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): things still appear and disappear, nothing moves.
- Trigger twice quickly: it retargets. The keyboard path animates like the pointer one. Positioning and `className` still work.
- Slow it down (DevTools Animations at 10%) to check the origin, the overshoot and the curve.

## Output

The change (CLI run, import swap or code), then in a few lines: the path taken, the gate result, the recipe used, and any style default changed and why.
