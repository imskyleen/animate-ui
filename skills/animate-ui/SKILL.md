---
name: animate-ui
description: Animate React components with Animate UI (Motion-based animated primitives for Radix UI, Base UI and React Aria). For shadcn/ui components, runs the `@animate-ui/cli` codemod that swaps their primitives for Animate UI's; for components built directly on Radix UI, Base UI or React Aria, swaps the import to `@animate-ui/react`; for anything else (custom components, plain markup, other libraries), applies Animate UI's motion rules, tokens (springs, curves, scales, blur, shifts) and recipes with Motion (motion/react). Also migrates Animate UI v1 projects. Use when asked to animate a component, make shadcn/ui "animated", add enter/exit, press or swap animations, set up Animate UI, change the animation pace, or review whether motion follows Animate UI's rules.
---

# Animate UI

Animate UI animates the primitives components are built on. Its package, `@animate-ui/react`, ships each Radix UI, Base UI and React Aria primitive with **exactly its library's API** and Motion inside, so swapping the import is the whole change.

Its motion is springy and alive, but coherent: nearly everything moves on a spring, each motion role has one value (the tokens), and tweens pick their curve by what the element does. It borrows Emil Kowalski's practical rules (trigger-anchored origins, ease-out for what enters and leaves, press feedback, a light blur to bridge swaps; see NOTICE.md) without his strictness: springs may overshoot a little, popups can start from 0.7, and the keyboard animates like the pointer.

## 1. Pick the path

| The request is about…                                                          | Do this                          |
| ------------------------------------------------------------------------------ | -------------------------------- |
| A shadcn/ui component (the project has `components.json`)                      | **A. Run the CLI**               |
| A component hand-built on Radix UI, Base UI or React Aria                      | **B. Swap the import**           |
| Custom, plain markup, another library, or a primitive Animate UI doesn't cover | **C. Animate it with the rules** |
| An Animate UI v1 project (`components/animate-ui/...` files)                   | **D. Migrate**                   |
| An app already on Animate UI: faster, slower, calmer                           | **§ Pace**                       |
| Reviewing existing motion                                                      | **C**, the rules as a checklist  |

Before writing motion by hand, check `references/catalog.md`: entrances, scroll reveals, counters, text effects, buttons, backgrounds and icons already ship, and using one beats rebuilding it.

## 2. Install

Paths A, B and C import `@animate-ui/react` and `motion`; add them with the project's package manager, read from its lockfile: `pnpm-lock.yaml` → `pnpm add`, `yarn.lock` → `yarn add`, `bun.lock`/`bun.lockb` → `bun add`, otherwise `npm install`. Run the CLI the same way (`pnpm dlx`, `yarn dlx`, `bun x`, `npx`; the commands below use pnpm). The primitive library the components already use (`radix-ui`, `@base-ui/react`, `react-aria-components`) stays installed: `@animate-ui/react` builds on it. Neither the CLI nor an import swap installs anything. `animate` warns when `@animate-ui/react` is neither in `package.json` nor in `node_modules`; `migrate` warns when a package it needs (`@base-ui/react`) isn't in `package.json`. Where installing isn't possible, add the entries to `package.json` by hand: `"@animate-ui/react": "^2.0.0"` and `"motion": "^14.0.0"` (the version `@animate-ui/react` needs).

Tailwind's version matters in two places (centering classes beside Motion's `transform`, and whether `hover:` is gated to fine pointers): `tailwindcss` 4 in `package.json` or `@import "tailwindcss"` in the CSS is v4; a `tailwind.config.*` with `tailwindcss` 3 is v3. When neither tells, take the form that works on both: a flex or grid wrapper for centering, `@media (hover: hover) and (pointer: fine)` around hover.

## 3. Gate: how much motion

The gate (§ Gate, under C) decides how much a component moves, and when to stop:

- **An explicit request is always honored.** Asked to animate something, animate it: the gate only picks the form, the shortest one when the component is used all day (a command palette on ⌘K gets a quick fade and slight scale, never a wait), and the output says why in one line. Never answer an explicit request with no motion.
- **An open request** ("make the page feel alive", "what do you think of the motion") may end with less motion, or none where motion would only add a wait. "Review it, then fix it" on something that already moves is explicit: keep it moving, in its right form.
- On **A** and **B** the gate only chooses which components to run: the primitives bring their own tokens. **D** and **§ Pace** skip it.

## A. shadcn/ui components: run the CLI

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest animate <component> --dry-run   # preview
pnpm dlx @animate-ui/cli@latest animate <component>             # or: animate all
```

`<component>` is the file's name in the ui folder (`dropdown-menu`, any case, with or without `.tsx`); several can follow each other, and `all --exclude sidebar,calendar` skips some. The CLI finds the components through `components.json`, swaps their primitive imports (`radix-ui`, `@radix-ui/react-*`, `@base-ui/react[/…]`, `react-aria-components`, `vaul`, `input-otp`, `@shadcn/react/questionnaire`) for `@animate-ui/react`, and removes the CSS animation classes Motion replaces (tw-animate utilities, Base UI `data-starting-style`/`data-ending-style` transitions, React Aria `data-entering`/`data-exiting`, CSS-variable heights). Parts of the same import that Animate UI doesn't animate (a Tabs root, a Slot) move with the others: `@animate-ui/react` re-exports them unchanged. It works for every shadcn base and style, is idempotent, and lists primitives it doesn't animate yet. Don't hand-edit what the CLI does; if its output looks wrong, report it.

What it leaves on purpose: `animate-none`, `origin-(--transform-origin)` and the like (Motion animates through inline styles, so `animate-none` can't fight it, and the origin variables are what Motion grows from), and plain Tailwind transitions such as `transition-colors` or a trigger's `transition-all` (color and hover feedback, not the enter or exit Motion now plays; the moving indicators copy and hide the selected look themselves).

## B. Built on Radix UI, Base UI or React Aria: swap the import

Add the packages (§ Install), then swap:

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

Mirror the library's import style: an umbrella import (`radix-ui`, `@base-ui/react`, `react-aria-components`) keeps its specifiers and only changes source; a per-package or subpath import (`@radix-ui/react-*`, `@base-ui/react/*`, `vaul` → `radix-ui/drawer`, `input-otp`, `@shadcn/react/questionnaire` → `@animate-ui/react/primitives/questionnaire`) uses the per-primitive path.

Then remove the component's own CSS animation classes so they don't run on top of Motion: tw-animate utilities (`animate-in`, `animate-out`, `fade-*`, `zoom-*`, `slide-in-from-*`, `slide-out-to-*`, and the `duration-*` beside them), Base UI's `data-starting-style:*`/`data-ending-style:*` transitions, React Aria's `data-entering:*`/`data-exiting:*` (and `entering:`/`exiting:`), and heights read from CSS variables (`h-(--radix-accordion-content-height)`, `animate-accordion-down`/`up`, `animate-collapsible-*`). Everything else stays: parts, props, data attributes, `forceMount`/`keepMounted`, render props, positioning classes, and the items' own highlighted or focus background (`data-highlighted:bg-*`, `focus:bg-accent`): the gliding highlight takes it. A modal centered with `-translate-x-1/2 -translate-y-1/2` keeps them under Tailwind v4 (the `translate` property composes with Motion's `transform`); under Tailwind v3 they'd fight it, so center it with a flex or grid wrapper instead. Animated parts accept two optional props, `transition` and `exitTransition` (Motion `Transition`s), except Animate UI's own drop-ins (`input-otp`, `@shadcn/react/questionnaire`): they take exactly their package's props, neither of those (`AnimateUIProvider`'s `tempo`, and `checkAnimation` for the questionnaire's checks, still apply). On a `QuestionnaireItem`, drop shadcn/ui's Animated Items example's tw-animate classes (`data-active:animate-in`, `data-active:fade-in-0`, `data-active:slide-in-from-bottom-2`, `data-active:duration-300`): they'd run on top of the step's entrance.

## Pace

To make every animation faster or slower at once, wrap the app in `AnimateUIProvider` (`@animate-ui/react/provider`, a client component: in a Next.js root layout, put it inside `<body>` around `{children}`) and set `tempo`: durations and delays are multiplied by it, springs keep their shape on the new time scale, reduced-motion fades included. "A little" is one step, `1.15` slower or `0.85` faster; "a lot" is `1.3` or `0.7`; asked again, take one more step from the current value (`1.15` → `1.3`); stay within `0.5`–`2`. Without the provider the defaults apply (`tempo` 1). It reaches every Animate UI primitive and any code that reads the tokens through `useTempoTransition()` or `useMotionTokens()`; the app's own motion with hand-typed values doesn't follow it: name those files in the output, and offer to move them onto the tokens.

## C. Anything else: animate it with the rules

1. **Catalog first**: if `references/catalog.md` has it (a counter, an entrance, a scroll reveal, a text effect, a button effect), use that.
2. **Gate** (below), then classify the component and start from the matching recipe in `references/recipes.md`.
3. If it renders a Radix UI, Base UI or React Aria overlay, prefer composing Animate UI's primitive over re-wiring presence yourself. A hand-rolled overlay stays hand-rolled unless the user asks: animating it doesn't mean moving it onto a library (that would change its focus, modality and dismissal), so wire Motion into it as it is, the way `references/base-libraries.md` shows for plain markup, and mention in the output what a primitive would add.
4. Motion runs in client components: put `'use client'` on the file that animates, and keep a server page server-side by moving the animated part into its own client component. Content that enters on mount starts hidden in the server HTML; keep that for what is below the fold or decorative, never for the page's main text on first paint.
5. Take every value from the tokens (`references/tokens.md`): `import { spring, transition, scale, blur, shift, ease, useTempoTransition, ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/react/utils/motion'`. Pass them through `useTempoTransition()` (or read them from `useMotionTokens()`) so `AnimateUIProvider`'s `tempo` applies. No hand-typed spring for a role a token covers, no ease-in (but a dismissed dialog's `transition.dismiss`, and a menubar's next content fading in on `transition.handoffIn`), no ease-in-out on an entrance.
6. Check every rule in `references/rules.md` (quality rules are non-negotiable; style rules are defaults), then verify (§ Verify).

### Gate: should it animate?

| How often it's used                                                    | Decision                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constantly (press, tooltips, menus, tabs, toggles, hover highlights)   | Animate, quickly: `spring.press`, `transition.menu`, `spring.pop`, `spring.selection`, `spring.highlight`; no hover scale                                                                            |
| Occasionally (popovers, selects, dialogs, sheets, toasts, disclosures) | The role's token: surfaces may take their time (`spring.dialog`, `transition.drawer` and `transition.sheet` in, `transition.dismiss` and `transition.drawerOut` out, `spring.toast` for edge toasts) |
| Rarely (effects, text, numbers, icons, onboarding, success)            | Expressive: their own springs, more bounce, longer rhythms                                                                                                                                           |
| Toggled from the keyboard all day (command palette, global shortcuts)  | The shortest form: a quick fade and a slight scale from `scale.menu` on `transition.menu`, closing no slower, no stagger; on an open request it may stay instant                                     |

Keyboard navigation animates like the pointer. Name the purpose in one word: feedback (it answers an action), spatial (where it comes from or goes), state (what changed), continuity (it's the same thing, moved), delight (a rare moment worth a flourish: a page's entrance, a success). On an open request, if no word fits, don't animate.

### Kinds of component

| Kind                                                                           | Examples                                                                | Recipe     |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------- |
| Anchored overlay                                                               | Popover, Tooltip, Hover Card, Preview Card                              | Overlay    |
| Anchored list                                                                  | Dropdown Menu, Context Menu, Menubar, Select, Combobox, Navigation Menu | Menu       |
| Centered overlay                                                               | Dialog, Alert Dialog                                                    | Modal      |
| Edge overlay                                                                   | Sheet, Drawer                                                           | Sheet      |
| Disclosure                                                                     | Accordion, Collapsible                                                  | Disclosure |
| Moving indicator                                                               | Tabs, Toggle Group, Pagination, Navigation Menu indicator               | Indicator  |
| Steps of a flow                                                                | Questionnaire                                                           | Steps      |
| Pressable                                                                      | Button, Toggle, Checkbox, Switch, Radio                                 | Press      |
| Pressable surface                                                              | Clickable card, tile, list row                                          | Card       |
| Centered list opened by a shortcut                                             | Command palette, spotlight search                                       | Palette    |
| Messages stacking at an edge, hand-built                                       | Toasts, snackbars, notifications                                        | Toast      |
| Page content                                                                   | Hero, sections, feature grids, stats                                    | Page       |
| Two states swapping in place                                                   | Copy → copied, sun → moon, a changing label                             | Swap       |
| Gesture or stack the library drives with CSS variables (Base UI Drawer, Toast) |                                                                         | CSS-driven |

### The rules in short

- Reduced motion ships with the animation: `ReducedMotionConfig` around the motion tree, `useShouldReduceMotion()` to neutralize `transform` strings, `<ReducedMotionConfig remount>` for animations that play on mount. Fades and blurs stay, movement goes.
- Transform, opacity and filter (height only where content must push what's below). Anchored popups grow from their trigger (library origin variables), from 0.7 / 0.8 / 0.9 by kind; modals stay centered.
- Press scales to 0.97 on a spring (0.985 for a whole card or row); the pressed element never scales on hover. Hover changes color, background, border or shadow; inside a clipped card the image may zoom and the card may lift a few pixels.
- Tweens: ease-out for what enters and leaves, a softer ease-out for what the eye watches change (disclosures unfolding, overlays, menus opening, sheets sliding in), ease-in-out for what moves on screen, `ease` for color; never ease-in, but a closed drawer speeds off its edge on a short one (`transition.drawerOut`), a dismissed dialog or sheet speeds away on a steady push (`transition.dismiss`), and a menubar's next content fades in behind the one leaving on a slow start (`transition.handoffIn`). A light blur bridges a swap.
- The exit replays the entrance (a dismissed dialog, drawer or sheet leaves at once, quicker, speeding away), its transition inside the `exit` target (an exiting element keeps its last props). Open from the start, it still animates.
- Keep the library element as the animated element (Radix `asChild`, Base UI `render`, React Aria `render`/`motion.create`) so `data-*` attributes and styles still apply.
- Warm tooltips show at once (and the one they replace goes at once).
- A menubar's popover moves to the next menu and resizes (`spring.morph`: it starts gently and eases in without going past, keeping its speed from menu to menu) instead of closing and reopening, its content changing in place: the content stays where it is on screen while the popover slides over it, the previous items leaving `shift.handoff` (6px) away from where it goes as they fade out (`transition.handoffOut`), the next ones arriving from there on `spring.handoff` and fading in behind them (`transition.handoffIn`): from File to Edit, File's leave to the left, Edit's come from the right. One popover on screen at every frame, each menu's content once (a menu coming back takes its leaving items back from where they are), and the triggers share one highlight gliding from trigger to trigger (internal/menu-handoff.ts, internal/item-highlight.tsx).
- The keyboard animates like the pointer; hover only on hover-capable fine pointers; re-triggering retargets, never restarts; loops pause off screen.

## D. Animate UI v1 projects: migrate

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest migrate all --dry-run
pnpm dlx @animate-ui/cli@latest migrate all
```

Dependencies: v1's Base UI primitives were built on Base UI's beta (`@base-ui-components/react`), v2's on Base UI 1, so a project using them adds `@base-ui/react` (the CLI says so) and removes the beta once nothing imports it; the same goes for `@headlessui/react` once its components are rebuilt.

It rewrites imports of the copied v1 primitives, icon core and libs to `@animate-ui/react`, maps v1 export names to the v2 parts, and lists manual steps (v1-only props, Headless UI primitives, which v2 doesn't support). The migration is partial where it must be: in an import mixing mappable parts with v1-only ones (`DropdownMenuHighlight`, context hooks like `useAccordionItem`), the mappable parts move to v2 and the v1-only names stay imported from the v1 file, each with a manual step. Those read v1's context, so they throw at runtime once their parent is v2: remove them (v2 parts animate themselves; use `data-state` attributes or controlled state), or replace the component with shadcn/ui's + `animate-ui animate`. Common cases:

- `useAccordionItem()` to know whether an item is open: control the accordion (`value`/`onValueChange`) and compare, or style the item with `data-[state=open]:` classes.
- `DropdownMenuHighlight` / `DropdownMenuHighlightItem`: drop them and give the items their own background (`focus:bg-accent`, as shadcn/ui's do); v2's highlight glides behind them and takes that background.
- Headless UI primitives (v2 doesn't support them): rebuild on the matching Base UI part (a Disclosure on `Collapsible` from `@animate-ui/react/primitives/base-ui/collapsible`, a Menu on `Menu`, a Dialog on `Dialog`).
- A v1 part given a Motion prop (`initial`, `animate`, `layoutId`) that v2's part doesn't take: drop it, v2's part animates itself.
- A child reading its parent's state after `useAccordionItem()` goes: `group` on the parent, `group-data-[state=open]:` on the child.
- A v1 sheet positioned by its own inline styles: v2's slides from its `data-side` but doesn't position it, so add the edge classes (`fixed inset-y-0 right-0`, `left-0`, `inset-x-0 top-0`, `bottom-0`).

At the end it lists the v1 files `@animate-ui/react` replaces that nothing imports anymore (and the ones still imported, by what). In a terminal it asks about each one (delete it, delete it and all the others, keep it, keep them all); `--delete` deletes them all and `--keep` keeps them all without asking. Non-interactive runs (CI, an agent's shell) keep them: pass `--delete` once the manual steps are done. It only removes the files `@animate-ui/react` replaces; v1 files a manual step made unused (a Headless UI primitive you rebuilt, and the v1 helpers only it imported, such as `lib/get-strict-context`) are yours to delete after checking nothing imports them; a rerun of `migrate` lists the ones `@animate-ui/react` replaces.

## Verify

- Every quality item of the checklist in `references/rules.md` passes; style deviations are named.
- Reduced motion (OS setting or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): things still appear and disappear, nothing moves.
- Trigger twice quickly: it retargets. The keyboard path animates like the pointer one. Positioning and `className` still work.
- Slow it down (DevTools Animations at 10%) to check the origin, the overshoot and the curve.

Without a browser (an agent's shell, CI), check what can be read. On A and B: the type-check passes with no new error, and the diff only swapped imports and removed animation classes. On C: the type-check passes with no new error; every value comes from a token; every element that moves has a reduced-motion path (`ReducedMotionConfig` around it, transform strings neutralized); every `exit` has its transition inside it and an `AnimatePresence` above it; nothing animates `width`, `height` (outside disclosures), `top`, `left` or `margin`; and say in the output that it wasn't run in a browser.

## Output

The change (CLI run, import swap or code), then in a few lines:

- **A, B**: what the CLI or the swap changed, the packages to add, and what was left on purpose.
- **C**: the gate result (and why, when it shortened or skipped motion), the catalog item or recipe used, the tokens, and any style default changed and why.
- **D**: the manual steps done and left, and the files deleted or kept.
- **Pace**: the tempo set and where.
