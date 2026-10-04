---
name: animate-ui
description: Animate React components with Animate UI (Motion-based animated primitives for Radix UI, Base UI and React Aria). For shadcn/ui components, runs the `@animate-ui/cli` codemod that swaps their primitives for Animate UI's; for components built directly on Radix UI, Base UI or React Aria, swaps the import to `@animate-ui/react`; for anything else (custom components, plain markup, other libraries), applies Animate UI's motion rules, tokens and recipes with Motion (motion/react). Also migrates Animate UI v1 projects. Use when asked to animate a component, make shadcn/ui "animated", add enter/exit or press animations, set up Animate UI, change the animation pace, or review whether motion follows Animate UI's rules.
---

# Animate UI

Animate UI animates the primitives components are built on. Its package, `@animate-ui/react`, ships each Radix UI, Base UI and React Aria primitive with **exactly its library's API** and Motion inside, so swapping the import is the whole change. The motion philosophy is based on Emil Kowalski's (see NOTICE.md), with one deliberate departure: entrances and state changes take 600ms on a strong ease-out that does most of the movement in the first ~150ms; exits take 400ms, press 150ms, and keyboard-driven or 100+/day actions stay instant.

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
3. Take every value from the tokens (`references/tokens.md`): `import { useMotionTokens, ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/react/utils/motion'`. `useMotionTokens()` follows `AnimateUIProvider`'s `tempo`. No hand-typed `stiffness`/`damping`, no `easeInOut` on an entrance; an intentionally instant change uses `transition.instant`.
4. Check every rule in `references/rules.md` (quality rules are non-negotiable; style rules are defaults), then verify (§ Verify).

### Gate: should it animate?

| How often it's used                                                         | Decision                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 100+ times a day (command palette, keyboard shortcuts, arrow-key highlight) | No animation (quality rule)                                   |
| Used constantly (tooltips, press, tabs indicator, toggles)                  | 600ms entrances and state changes, press 150ms; bounce ≤ 0.15 |
| Occasional (popovers, menus, selects, dialogs, sheets, drawers, toasts)     | 600ms in, 400ms out                                           |
| Rare (icons, effects, text, onboarding, success, delight)                   | Expressive: around 600ms, bounce up to 0.3                    |

Never animate keyboard navigation or global shortcuts. Name the purpose in one word (feedback, spatial, state, continuity, delight); if you can't, don't animate.

### Kinds of component

| Kind                                                                           | Examples                                             | Recipe     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------- |
| Anchored overlay                                                               | Popover, Tooltip, Menu, Hover Card, Select, Combobox | Overlay    |
| Centered overlay                                                               | Dialog, Alert Dialog                                 | Modal      |
| Edge overlay                                                                   | Sheet, Drawer                                        | Sheet      |
| Disclosure                                                                     | Accordion, Collapsible                               | Disclosure |
| Moving indicator                                                               | Tabs, Toggle Group, Navigation Menu                  | Indicator  |
| Pressable                                                                      | Button, Toggle, Checkbox, Switch, Radio              | Press      |
| Gesture or stack the library drives with CSS variables (Base UI Drawer, Toast) |                                                      | CSS-driven |

### Non-negotiable rules (summary)

- Reduced motion ships with the animation: `ReducedMotionConfig` around the motion tree, `useShouldReduceMotion()` to neutralize `transform` strings, `<ReducedMotionConfig remount>` for animations that play on mount.
- Transform and opacity only (height only for disclosures). Never `scale(0)`. Anchored overlays scale from the trigger (library origin variables), modals stay centered.
- Exits are faster than entrances, and their transitions live in the `exit` target (an exiting element keeps its last props).
- Keep the library element as the animated element (Radix `asChild`, Base UI `render`, React Aria `render`/`motion.create`) so `data-*` attributes and styles still apply.
- Hover only on hover-capable fine pointers; drags follow the pointer with no lag; re-triggering retargets, never restarts; loops pause off screen.

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
- Trigger twice quickly: it retargets. Keyboard paths are instant. Positioning and `className` still work.
- Slow it down (DevTools Animations at 10%) to check origin and overshoot.

## Output

The change (CLI run, import swap or code), then in a few lines: the path taken, the gate result, the recipe used, and any style default changed and why.
