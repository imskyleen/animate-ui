---
name: animate-ui
description: Animate React components with Animate UI (Motion-based animated primitives for Radix UI, Base UI and React Aria). For shadcn/ui components, runs the `@animate-ui/cli` codemod that swaps their primitives for Animate UI's; for components built directly on Radix UI, Base UI or React Aria, swaps the import to `@animate-ui/react`; for anything else (custom components, plain markup, other libraries), applies Animate UI's motion rules, tokens (springs, curves, scales, blur, shifts) and recipes with Motion (motion/react). Also reviews existing motion with the `audit` command, migrates Animate UI v1 projects, and turns any icon (Lucide, Hugeicons, Tabler, Phosphor, a custom SVG) into an animated icon compatible with `AnimateIcon`. Use when asked to animate a component, make shadcn/ui "animated", add enter/exit, press or swap animations, set up Animate UI, animate an icon, change the animation pace, review whether motion follows Animate UI's rules, or find slow and janky animations.
---

# Animate UI

Animate UI animates the primitives components are built on. Its package, `@animate-ui/react`, ships each Radix UI, Base UI and React Aria primitive with **exactly its library's API** and Motion inside, so swapping the import is the whole change.

Its motion is springy and alive, but coherent: nearly everything moves on a spring, each motion role has one value (the tokens), and tweens pick their curve by what the element does. It borrows Emil Kowalski's practical rules (trigger-anchored origins, ease-out for what enters and leaves, press feedback, a light blur to bridge swaps; see NOTICE.md) without his strictness: springs may overshoot a little, popups can start from 0.7, and the keyboard animates like the pointer.

## 1. Pick the path

| The request is about…                                                          | Do this                                |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| A shadcn/ui component (the project has `components.json`)                      | **A. Run the CLI**                     |
| A component hand-built on Radix UI, Base UI or React Aria                      | **B. Swap the import**                 |
| Custom, plain markup, another library, or a primitive Animate UI doesn't cover | **C. Animate it with the rules**       |
| An Animate UI v1 project (`components/animate-ui/...` files)                   | **`references/migrate.md`**            |
| An app already on Animate UI: faster, slower, calmer                           | **§ Pace**                             |
| Reviewing existing motion, finding slow or janky animations                    | **`references/review.md`**             |
| One rule to fix in existing motion (reduced motion, a loop)                    | **C**, step 8 and that rule only       |
| An animation to reproduce: a link, a video, a GIF, a CSS or JS snippet         | **`references/reproduce.md`**          |
| A feel in words ("snappier", "plus doux", "bouncy") or CSS for a token         | **`references/feel.md`**               |
| An interaction by name: a loading button, a list, a swipe, a banner…           | **C**, from `references/interactions/` |
| An icon to animate, from any library or SVG                                    | **`references/icons.md`**              |

Before writing motion by hand, check `references/catalog.md`: entrances, scroll reveals, counters, text effects, buttons, backgrounds and icons already ship, and using one beats rebuilding it.

## 2. Install

Paths A, B and C import `@animate-ui/react` and `motion` (C only when it writes Motion code; a CSS or Tailwind-only request adds no package); add them with the project's package manager, read from its lockfile: `pnpm-lock.yaml` → `pnpm add`, `yarn.lock` → `yarn add`, `bun.lock`/`bun.lockb` → `bun add`, otherwise `npm install`. Run the CLI the same way (`pnpm dlx`, `yarn dlx`, `bun x`, `npx`; the commands below use pnpm). The primitive library the components already use (`radix-ui`, `@base-ui/react`, `react-aria-components`) stays installed: `@animate-ui/react` builds on it. Neither the CLI nor an import swap installs anything. `animate` warns when `@animate-ui/react` is neither in `package.json` nor in `node_modules`; `migrate` warns when a package it needs (`@base-ui/react`) isn't in `package.json`. Where installing isn't possible, add the entries to `package.json`'s `dependencies` by hand and give the install command in the output (its other peer dependencies are optional): `"@animate-ui/react": "^2.0.0"` and `"motion": "^14.0.0"` (the version `@animate-ui/react` needs; an existing `motion` entry that allows 14 stays as it is, `"latest"` and `"*"` included).

Tailwind's version matters in two places (centering classes beside Motion's `transform`, and whether `hover:` is gated to fine pointers): `tailwindcss` 4 in `package.json` or `@import "tailwindcss"` in the CSS is v4; a `tailwind.config.*` with `tailwindcss` 3 is v3; class syntax only v4 has (bare `data-open:` variants, `(--var)` values like `h-(--x)`) means v4 too. When nothing tells, take the form that works on both: margins for centering (`inset-0 m-auto h-fit`, a wrapper that already centers stays), `[@media(hover:hover)_and_(pointer:fine)]:hover:` for hover, and a hover border with an explicit color (a bare `border` is gray in v3, the text color in v4).

## 3. Gate: how much motion

The gate (§ Gate, under C) decides how much a component moves, and when to stop:

- **An explicit request is always honored.** Asked to animate something, animate it: the gate only picks the form, the shortest one when the component is used all day (a command palette on ⌘K gets a quick fade and slight scale, never a wait), and the output says why in one line. Never answer an explicit request with no motion.
- **An open request** ("make the page feel alive", "what do you think of the motion") may end with less motion, or none where motion would only add a wait. "Review it, then fix it" on something that already moves is explicit: keep it moving, in its right form.
- **Ask the level when it isn't given.** Never ask on A, B, a migration, § Pace or a review's fixes: the swap is the whole answer (even when the request names enter and exit), and a review's fixes keep the element's motion in its right form. A level or feel word anywhere in the request answers it, even beside praise or a named interaction. "Cycle", "fade" or "drag to close" names the effect: subtle, with that effect leading. Otherwise a request to animate something that names no level, feel or reference ("anime ma liste", "add an animation to this button") gets one question before any code: which level, **subtle**, **more** or **expressive** (`references/feel.md`, § Levels), each with what it would look like on this component in a few words, the one the gate suggests marked as recommended. A link, a video or "like an Animate UI sheet" answers it too. When nobody can answer (a non-interactive run), take **subtle** and say so in the output. A feel word ("vivant", "calm", "snappy") sets the feel (`feel.md`) at the subtle level, unless the word is about how much ("plus animé", "bouncy", "expressive"). The recipes and the catalog's defaults are written at the subtle level. "Nice", "nicely", "cool" alone are praise, not a feel, and an interaction named alone (a swipe, a reorder, a skeleton) names no level: ask.
- On **A** the request names the components ("all" runs all of them, `--exclude` leaves some out); on **B**, the one asked. Neither shortens the motion: the primitives bring their own tokens. Migrating (`references/migrate.md`) and **§ Pace** skip it.

## A. shadcn/ui components: run the CLI

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest animate <component> --dry-run   # preview
pnpm dlx @animate-ui/cli@latest animate <component>             # or: animate all
```

`<component>` is the file's name in the ui folder (`dropdown-menu`, any case, with or without `.tsx`); several can follow each other, and `all --exclude sidebar,calendar` skips some. The CLI finds the components through `components.json`, swaps their primitive imports (`radix-ui`, `@radix-ui/react-*`, `@base-ui/react[/…]`, `react-aria-components`, `vaul`, `input-otp`, `@shadcn/react/questionnaire`) for `@animate-ui/react`, and removes the CSS animation classes Motion replaces (tw-animate utilities, Base UI `data-starting-style`/`data-ending-style` transitions, React Aria `data-entering`/`data-exiting`, Base UI's CSS-variable heights; Radix's `h-(--radix-accordion-content-height)` stays, harmless). Parts of the same import that Animate UI doesn't animate (a Tabs root, a Slot) move with the others: `@animate-ui/react` re-exports them unchanged. It works for every shadcn base and style, is idempotent, and lists primitives it doesn't animate yet. Don't hand-edit what the CLI does; if its output looks wrong, report it.

On Tailwind 3 it also recenters modals with margins (`inset-0 m-auto h-fit`) instead of the translate classes Motion's transform would cancel; it reads the version from `package.json`, `components.json`, a config file, or the file's own class syntax. What it leaves on purpose: `animate-none`, `animate-none!`, `origin-(--transform-origin)` and the like (Motion animates through inline styles, so neither can fight it, and the origin variables are what Motion grows from), and plain Tailwind transitions such as `transition-colors` or a trigger's `transition-all` (color and hover feedback, not the enter or exit Motion now plays; the moving indicators copy and hide the selected look themselves).

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

Mirror the library's import style: an umbrella import (`radix-ui`, `@base-ui/react`, `react-aria-components`) keeps its specifiers and only changes source; a per-package or subpath import (`@radix-ui/react-*`, `@base-ui/react/*`, `vaul` → `radix-ui/drawer`, `input-otp`, `@shadcn/react/questionnaire` → `@animate-ui/react/primitives/questionnaire`) uses the per-primitive path. The whole import moves, even when only one part was asked for: parts Animate UI doesn't animate are re-exported unchanged. A Base UI subpath Animate UI doesn't animate (`@base-ui/react/field`) stays on Base UI.

Then remove the component's own CSS animation classes so they don't run on top of Motion: tw-animate utilities (`animate-in`, `animate-out`, `fade-*`, `zoom-*`, `slide-in-from-*`, `slide-out-to-*`, and the `duration-*` beside them), Base UI's `data-starting-style:*`/`data-ending-style:*` transitions, React Aria's `data-entering:*`/`data-exiting:*` (and `entering:`/`exiting:`), and the height keyframes (`animate-accordion-down`/`up`, `animate-collapsible-*`; Base UI's `h-(--accordion-panel-height)` too, while Radix's `h-(--radix-accordion-content-height)` can stay: the animated content sets that variable to `auto`). Everything else stays: parts, props, data attributes, `forceMount`/`keepMounted`, render props, positioning classes, and the items' own highlighted or focus background (`data-highlighted:bg-*`, `focus:bg-accent`): the gliding highlight takes it. A modal centered with `-translate-x-1/2 -translate-y-1/2` keeps them under Tailwind v4 (the `translate` property composes with Motion's `transform`); under Tailwind v3, or when the version can't be told (§ Install), they'd fight it, so center it with margins instead of a transform: replace `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` with `inset-0 m-auto h-fit` (its width classes stay). Animated parts that enter and leave (contents, overlays, indicators) accept two optional props, `transition` and `exitTransition` (Motion `Transition`s); parts that only move (a switch thumb, a slider, a progress bar) accept `transition`. The exceptions are Animate UI's own drop-ins (`input-otp`, `@shadcn/react/questionnaire`): they take exactly their package's props, neither of those (`AnimateUIProvider`'s `tempo`, and `checkAnimation` for the questionnaire's checks, still apply). On a `QuestionnaireItem`, drop shadcn/ui's Animated Items example's tw-animate classes (`data-active:animate-in`, `data-active:fade-in-0`, `data-active:slide-in-from-bottom-2`, `data-active:duration-300`): they'd run on top of the step's entrance.

## Pace

To make every animation faster or slower at once, wrap the app in `AnimateUIProvider` (`@animate-ui/react/provider`, a client component: in a Next.js root layout, put it inside `<body>` around `{children}`) and set `tempo`: durations and delays are multiplied by it, springs keep their shape on the new time scale, reduced-motion fades included. "A little" or no amount ("speed it up", "feels sluggish") is one step, `1.15` slower or `0.85` faster; "a lot" is `1.3` or `0.7`; asked again, take one more step from the current value (`1.15` → `1.3`); stay within `0.5`–`2`. Without the provider the defaults apply (`tempo` 1). "Faster" or "sluggish" about the whole app is this; about one component, `feel.md`. It reaches every Animate UI primitive and any code that reads the tokens through `useTempoTransition()` or `useMotionTokens()`; the app's own motion with hand-typed values (Motion props, Tailwind `duration-*`, CSS transitions) doesn't follow it: name those files in the output, and offer to move them onto the tokens.

## C. Anything else: animate it with the rules

1. **Know the technique.** Motion's documentation and examples (motion.dev) show how most interactions are built; when a tool can read them, learn the technique there, then write it with Animate UI's tokens and rules. Present the result as the user's animation, not as someone's example.
2. **Catalog first**: if `references/catalog.md` has it (a counter, an entrance, a scroll reveal, a text effect, a button effect), use that. Whenever an Animate UI component does the job (a word cycling, tabs, a copy button, a pressed button, a counter), use it rather than writing the motion by hand, and use it whole, with its animated parts: Tabs take `TabsHighlight` for the list and `TabsContents` with a `TabsContent` per value for what changes under it, never a list over a panel swapped by hand. When its layout gets in the way (Rotating Text is a block), change the layout or the props around it (`align`, an `inline-block` style) instead of replacing it.
3. **Gate** (below), then classify the component and start from the matching recipe: `references/recipes/<kind>.md` (the table below) for overlays, menus, controls, cards, toasts and pages; `references/interactions/` for interactions asked by name (a status button, a list that adds and removes, a drag to reorder, a card opening into a view, a skeleton, a counting badge, a field in error, a swipe to delete, a filtered grid, form steps, a banner).
4. If it renders a Radix UI, Base UI or React Aria overlay, prefer composing Animate UI's primitive over re-wiring presence yourself. A hand-rolled overlay stays hand-rolled unless the user asks: animating it doesn't mean moving it onto a library (that would change its focus, modality and dismissal), so wire Motion into it as it is, the way `references/base-libraries.md` shows for plain markup, and mention in the output what a primitive would add. A drag or swipe asked on a hand-built sheet counts as asking: move it onto `@animate-ui/react/primitives/radix-ui/drawer` (`import { Drawer }`: `Drawer.Root` with `direction`, `Drawer.Portal`, `Drawer.Overlay`, `Drawer.Content`, `Drawer.Handle`, `Drawer.Title`, `Drawer.Description`), add `radix-ui` when it's missing, and say in the output what changes (focus is trapped inside, Escape closes it, the page stops scrolling behind it).
5. Motion runs in client components: put `'use client'` on the file that writes Motion code, and keep a server page server-side by moving the animated part into its own client component. Content that enters on mount starts hidden in the server HTML; keep that for what is below the fold or decorative, never for the page's main text on first paint. When an explicit request animates content likely in the first viewport, do it and say in the output that it's hidden until hydration. Markup that differs under reduced motion or at a screen size reads them with hooks that give the server's value while hydrating (`useShouldReduceMotion()`, a `useSyncExternalStore` with a server snapshot), never Motion's `useReducedMotion()` or `window.matchMedia` during render: otherwise React throws the server HTML away and renders the page again.
6. When the user describes a feel ("snappy", "calme", "more bounce"), read it with `references/feel.md` before picking values. For CSS without Motion (a stylesheet, Tailwind, a server component), print a token's timing with `node <skill>/scripts/css-timing.mjs <token>` (the script ships with this skill) from the project's folder, so it loads the project's `@animate-ui/react`; without the package, write the tween tokens' values from `tokens.md` as `cubic-bezier`.
7. Take every value from the tokens (`references/tokens.md`): `import { spring, transition, scale, blur, shift, ease, useTempoTransition, ReducedMotionConfig, useShouldReduceMotion } from '@animate-ui/react/utils/motion'`. Pass them through `useTempoTransition()` (or read them from `useMotionTokens()`) so `AnimateUIProvider`'s `tempo` applies. No hand-typed spring for a role a token covers (a recipe's own distances and scales stay as written), no ease-in (but a dismissed dialog's `transition.dismiss`, and a menubar's next content fading in on `transition.handoffIn`), no ease-in-out on an entrance. Animated icons are the exception: their values live in the icon file (`references/icons.md`).
8. Check every rule in `references/rules.md` (quality rules are non-negotiable; style rules are defaults), then verify (§ Verify).

### Gate: should it animate?

| How often it's used                                                    | Decision                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constantly (press, tooltips, menus, tabs, toggles, hover highlights)   | Animate, quickly: `spring.press`, `transition.menu`, `spring.pop`, `spring.selection`, `spring.highlight`; no hover scale                                                                            |
| Occasionally (popovers, selects, dialogs, sheets, toasts, disclosures) | The role's token: surfaces may take their time (`spring.dialog`, `transition.drawer` and `transition.sheet` in, `transition.dismiss` and `transition.drawerOut` out, `spring.toast` for edge toasts) |
| Rarely (effects, text, numbers, icons, onboarding, success)            | Their own motion: own springs, more bounce, longer rhythms (icons: `icons.md`)                                                                                                                       |
| Toggled from the keyboard all day (command palette, global shortcuts)  | The shortest form: a quick fade and a slight scale from `scale.menu` on `transition.menu`, closing no slower, no stagger; on an open request it may stay instant                                     |

Keyboard navigation animates like the pointer. Name the purpose in one word: feedback (it answers an action), spatial (where it comes from or goes), state (what changed), continuity (it's the same thing, moved), delight (a rare moment worth a flourish: a page's entrance, a success). On an open request, if no word fits, don't animate.

### Kinds of component

Recipes and the gate table are for C; on B the primitive brings its own motion.

| Kind                                                                           | Examples                                                                | Recipe                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------- |
| Anchored overlay                                                               | Popover, Tooltip, Hover Card, Preview Card                              | `recipes/overlay.md`    |
| Anchored list                                                                  | Dropdown Menu, Context Menu, Menubar, Select, Combobox, Navigation Menu | `recipes/menu.md`       |
| Centered overlay                                                               | Dialog, Alert Dialog                                                    | `recipes/modal.md`      |
| Edge overlay                                                                   | Sheet, Drawer                                                           | `recipes/sheet.md`      |
| Disclosure                                                                     | Accordion, Collapsible                                                  | `recipes/disclosure.md` |
| Moving indicator                                                               | Tabs, Toggle Group, Pagination, Navigation Menu indicator               | `recipes/indicator.md`  |
| Steps of a flow                                                                | Questionnaire                                                           | `recipes/steps.md`      |
| Pressable                                                                      | Button, Toggle, Checkbox, Switch, Radio                                 | `recipes/press.md`      |
| Pressable surface                                                              | Clickable card, tile, list row                                          | `recipes/card.md`       |
| Centered list opened by a shortcut                                             | Command palette, spotlight search                                       | `recipes/palette.md`    |
| Messages stacking at an edge, hand-built                                       | Toasts, snackbars, notifications fixed to a screen edge                 | `recipes/toast.md`      |
| Page content                                                                   | Hero, sections, feature grids, stats                                    | `recipes/page.md`       |
| Two states swapping in place                                                   | Copy → copied, sun → moon, a changing label (rules B9)                  | `recipes/swap.md`       |
| Gesture or stack the library drives with CSS variables (Base UI Drawer, Toast) |                                                                         | `recipes/css-driven.md` |

### The rules in short

- Reduced motion ships with the animation: `ReducedMotionConfig` around the motion tree, `useShouldReduceMotion()` to neutralize `transform` strings, `<ReducedMotionConfig remount>` for animations that play on mount. Fades and blurs stay, movement goes.
- Transform, opacity and filter (height only where content must push what's below). Anchored popups grow from their trigger (library origin variables), from 0.7 / 0.8 / 0.9 by kind; modals stay centered.
- Press scales to 0.97 on a spring (0.985 for a whole card or row); the pressed element never scales on hover. Hover changes color, background, border or shadow; inside a clipped card the image may zoom and the card may lift a few pixels.
- Tweens: ease-out for what enters and leaves, a softer ease-out for what the eye watches change (disclosures unfolding, overlays, menus opening, sheets sliding in), ease-in-out for what moves on screen, `ease` for color; never ease-in, but a closed drawer speeds off its edge on a short one (`transition.drawerOut`), a dismissed dialog or sheet speeds away on a steady push (`transition.dismiss`), and a menubar's next content fades in behind the one leaving on a slow start (`transition.handoffIn`). A light blur bridges a swap.
- Nothing stretches: a box resized with `layout` gets `layout` on its children (or its height animated instead), so text, icons and images keep their proportions. A changing text fades, blurs or slides, never scales; Animate UI's texts (Rotating, Morphing, Rolling Text, Sliding Number) for the expressive level.
- The exit replays the entrance (a dismissed dialog, drawer or sheet leaves at once, quicker, speeding away), its transition inside the `exit` target (an exiting element keeps its last props). Open from the start, it still animates.
- Keep the library element as the animated element (Radix `asChild`, Base UI `render`, React Aria `render`/`motion.create`) so `data-*` attributes and styles still apply.
- Warm tooltips show at once (and the one they replace goes at once).
- A menubar's popover moves to the next menu and resizes (`spring.morph`: it starts gently and eases in without going past, keeping its speed from menu to menu) instead of closing and reopening, its content changing in place: the content stays where it is on screen while the popover slides over it, the previous items leaving `shift.handoff` (6px) away from where it goes as they fade out (`transition.handoffOut`), the next ones arriving from there on `spring.handoff` and fading in behind them (`transition.handoffIn`): from File to Edit, File's leave to the left, Edit's come from the right. One popover on screen at every frame, each menu's content once (a menu coming back takes its leaving items back from where they are), and the triggers share one highlight gliding from trigger to trigger (internal/menu-handoff.ts, internal/item-highlight.tsx).
- The keyboard animates like the pointer; hover only on hover-capable fine pointers; re-triggering retargets, never restarts; loops pause off screen.

## Verify

With a browser, look at frames in the middle of each animation, not only at rest: nothing passes over a label it shouldn't, the words around a change don't move, text keeps its baseline, and every part that changes state animates (a chevron that flips at once is a miss). An element handed from one layer to another (a shared `layoutId` gliding out of an intro into the header) stays above anything still fading on top of it: raise its new layer over the fading one, or it shows through the veil (a white logo turning grey mid-glide).

- Run the type-check before touching anything, even for a one-line swap: its output is the before.
- Every quality item of the checklist in `references/rules.md` passes; style deviations are named.
- Reduced motion (OS setting or Playwright `emulateMedia({ reducedMotion: 'reduce' })`): things still appear and disappear, nothing moves.
- Trigger twice quickly: it retargets. The keyboard path animates like the pointer one. Positioning and `className` still work.
- Slow it down (DevTools Animations at 10%) to check the origin, the overshoot and the curve.

Without a browser (an agent's shell, CI), check what can be read. On A and B: the type-check passes with no new error (compare its output before and after), and the diff only swapped imports, removed animation classes, replaced a modal's translate centering where § B asks for it, and added the package entries. The primitives bring their own enter and exit, overlays included. On C: the type-check passes with no new error; every value comes from a token or the recipe; every element that moves has a reduced-motion path (`ReducedMotionConfig` around it, transform strings neutralized); every `exit` has its transition inside it and an `AnimatePresence` above it; nothing animates `width`, `height` (outside disclosures), `top`, `left` or `margin`; and say in the output that it wasn't run in a browser. For CSS without Motion, the checks at the end of `feel.md`.

## Output

The change (CLI run, import swap or code), then in a few lines:

- **A, B**: what the CLI or the swap changed, the packages to add, what was left on purpose, and the type-check before and after. Nothing to remove is a complete answer.
- **C**: the level (asked, or subtle by default), the gate result (and why, when it shortened or skipped motion), the catalog item or recipe used, the tokens, and any style default changed and why.
- **Feel**: the word, the step or row taken, the token or spring written, and the role kept.
- **Migrate**: the manual steps done and left, and the files deleted or kept.
- **Reproduce**: what was read or measured, the tokens it became or the values kept, and what the reference didn't show.
- **Icon**: the file and where it went, what the icon does and why it means that, its trigger and why, the level, the usages replaced, the original files left, and any technique or rule of `icons.md` adapted or set aside.
- **Review**: the findings (file:line, why, fix), the facts dismissed and why, and the audit's before/after when fixes were made.
- **Pace**: the tempo set and where.
