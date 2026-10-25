# Vue

A Vue project (`vue` in `package.json`, Nuxt, or a `components.json` whose `$schema` is shadcn-vue's) takes the same paths, gate, levels, tokens, recipes and rules as React. This file says what changes: the packages, the import paths, and how the code is written. Everything not named here applies as written in `SKILL.md` and the other references, read with these swaps:

- `@animate-ui/react` → `@animate-ui/vue`, `motion` → `motion-v`, `motion/react` → `motion-v`, and every catalog path under `@animate-ui/react/…` lives at the same place under `@animate-ui/vue/…`.
- No `'use client'`: Nuxt's `<ClientOnly>` (§ C below) covers what must not render on the server.
- Props in camelCase become kebab-case attributes in templates, callbacks become events, React state becomes refs.

## Packages

`@animate-ui/vue` and `motion-v` (Motion for Vue), added with the project's package manager (§ Install). The primitive library stays installed: `reka-ui` (shadcn-vue's components are built on it). Some parts need one more package, already there when the component uses it: `vue-input-otp` (Input OTP), `@floating-ui/vue` (Animate UI's own Tooltip), `shiki` (Code Block). By hand: `"@animate-ui/vue": "^2.0.0"` and `"motion-v": "^2.8.0"`.

## A. shadcn-vue components: run the CLI

The same commands: `animate <component>`, `animate all`, `--exclude`, `--dry-run`. The CLI reads `components.json`, sees shadcn-vue, and in every file of `components/ui/<name>/` swaps `reka-ui` imports for `@animate-ui/vue/primitives/reka-ui` (`vue-input-otp` for `@animate-ui/vue/primitives/input-otp`), removes the CSS animation classes Motion replaces, and gives a sheet's side to its content. It animates accordion, alert-dialog, checkbox, collapsible, combobox, context-menu, dialog, drawer, dropdown-menu, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, select, sheet, slider, switch, tabs, toggle, toggle-group and tooltip; it names the others it leaves.

Three shadcn-vue components have no import to swap, and one has a part to add: their docs pages give the steps (`animate-ui.com/docs/vue/primitives/reka-ui/<name>`).

- **Questionnaire**: its logic lives in its own files. Three edits: `useQuestionnaireMotion(rootElement)` in `Questionnaire.vue`; in `QuestionnaireChoice.vue`, `const press = useChoicePress(() => disabled.value)` and the root `<label>` becomes `<motion.label v-bind="press">`; in `QuestionnaireProgress.vue`, the default label becomes `Question <QuestionnaireCount :value="root.current.value" /> of <QuestionnaireCount :value="root.total.value" />`. All three come from `@animate-ui/vue/primitives/questionnaire`.
- **Sidebar**: built on `@animate-ui/vue/primitives/sidebar` (its docs page lists the edits in `utils.ts` and the parts).
- **Combobox with a trigger button**: the label the button shows (`{{ selected?.label ?? '…' }}`) is plain text with no reka-ui part to swap. Wrap it in `ComboboxValue` (from `@animate-ui/vue/primitives/reka-ui`) so it swaps as the choice changes, like `SelectValue` does.
- **Toast**: shadcn-vue's toast is Sonner, not reka-ui. For an animated toast, build the list on `@animate-ui/vue/primitives/reka-ui/toast` (reka-ui's toast manager; `status` where Base UI says `type`, and Animate UI's `ToastContent` around what a toast shows).

## B. Built on reka-ui: swap the import

```ts
import { DialogContent, DialogRoot } from 'reka-ui'; // before
import { DialogContent, DialogRoot } from '@animate-ui/vue/primitives/reka-ui'; // after (re-exports all of reka-ui)
import { OTPInput } from 'vue-input-otp'; // before
import { OTPInput } from '@animate-ui/vue/primitives/input-otp'; // after
```

The whole import moves; parts Animate UI doesn't animate are re-exported unchanged. Remove the component's CSS animation classes as § B says (tw-animate utilities and the `duration-*` beside them, `animate-accordion-*`, `animate-collapsible-*`); keep everything else. Animated parts that enter and leave take `transition` and `exit-transition`, parts that only move take `transition`. A drag or swipe asked on a hand-built sheet (C, step 4) moves it onto reka-ui's Drawer through `@animate-ui/vue/primitives/reka-ui` (`DrawerRoot` with `swipe-direction`, `DrawerPortal`, `DrawerOverlay`, `DrawerContent`, `DrawerTitle`, `DrawerDescription`); Vaul isn't used in Vue.

Animate UI's own primitives keep React's paths under `@animate-ui/vue/primitives/` (`texts/sliding-number`, `effects/fade`, `buttons/button`, `tabs`, `tooltip`, `bottom-navigation`, `github-stars`, `code-block`…), with kebab-case props in templates (`:initial-blur`, `in-view`) and events instead of callbacks (`@done`, `@number-change`). Where React takes a ref object, Vue takes the element: `:scroll-container="scrollRef"` with a template ref.

## Files added to the project

What the catalog calls "a file you add" (icons, backgrounds, the Flip, Liquid, GitHub Stars and Theme Toggler buttons, the Code Block, the Page Transition) comes from the Vue registry, with shadcn-vue:

```bash
pnpm dlx shadcn-vue@latest add https://animate-ui.com/r/vue/<name>.json
```

With `"registries": { "@animate-ui": "https://animate-ui.com/r/vue/{name}.json" }` in `components.json`, `add @animate-ui/<name>` and `search @animate-ui` work too. Names: `icons-lucide-<icon>`, `icons-hugeicons-<icon>`, `backgrounds-<name>`, `buttons-flip`, `buttons-liquid`, `buttons-github-stars`, `buttons-theme-toggler`, `components-code-block`, `components-page-transition`. They land in `components/animate-ui/<group>/…` as `.vue` files.

## Pace

`<AnimateUIProvider :tempo="1.15">` from `@animate-ui/vue/provider`, around the app in `App.vue` (Nuxt: `app.vue`). It also takes `check-animation` and `reduced-motion`.

## C. Writing the motion in Vue

Motion for Vue mirrors Motion's React API in templates:

```vue
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import {
  blur,
  ReducedMotionConfig,
  scale,
  spring,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/vue/utils/motion';

const open = defineModel<boolean>('open');
const reduce = useShouldReduceMotion();
const enter = useTempoTransition(() => spring.pop);
const exit = useTempoTransition(() => transition.popOut);
</script>

<template>
  <ReducedMotionConfig>
    <AnimatePresence>
      <motion.div
        v-if="open"
        :initial="{
          opacity: 0,
          scale: reduce ? 1 : scale.popover,
          filter: blur.surface,
        }"
        :animate="{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: enter,
        }"
        :exit="{
          opacity: 0,
          scale: reduce ? 1 : scale.popover,
          filter: blur.surface,
          transition: exit,
        }"
      />
    </AnimatePresence>
  </ReducedMotionConfig>
</template>
```

- Tokens come from `@animate-ui/vue/utils/motion`, under the same names as in `tokens.md`. `useTempoTransition` takes a getter and returns a computed (`enter` in a template, `enter.value` in script); `useMotionTokens()` returns a ref of every token; `useShouldReduceMotion()` a computed boolean.
- A list (`v-for`) goes in `AnimatePresence`: outside `mode="wait"` it is a `TransitionGroup`, and `as="ul"` makes it the list element itself. `interactions/list.md` has the Vue version, with the focus handed on as an item leaves.
- Press is `while-press` (Motion for Vue has no `whileTap`), hover `while-hover`, in view `while-in-view`; `layout`, `layout-id`, `variants`, `custom` as in React. A key swapped inside `AnimatePresence` is `:key`, and `mode="popLayout"` works the same.
- `<ReducedMotionConfig remount>` replays mount animations under reduced motion, as in React.
- What React writes with state and effects becomes refs, `computed` and `watch`; an element's `ref` becomes a template ref; an imperative `animate()` call is the same function from `motion-v`.
- Nuxt renders on the server: the same rule as § C step 5 applies (no `window.matchMedia` in setup; `useShouldReduceMotion()` is safe), and `<ClientOnly>` replaces a client component for what must not render on the server.
- **Page transitions** (`recipes/route.md`): add `components-page-transition`, call `routeTransitions(router)` once (`main.ts`, or a Nuxt plugin with `useRouter()`, Nuxt's `experimental.viewTransition` left off), and wrap the page: `<RouterView v-slot="{ Component }"><PageTransition effect="slide"><component :is="Component" /></PageTransition></RouterView>` (Nuxt: around `<NuxtPage />`). Going back in the history plays back; `startTransition(update, { types: ['push', 'nav-forward'] })` from `motion-v` picks an effect for one navigation.
- **Icons** (`icons.md`): a Vue icon is a `.vue` file. Its `<script lang="ts">` exports `animations` (the same objects as React's) and its `<script setup>` renders `IconWrapper` from `@animate-ui/vue/icons`, whose slot gives `variants`, `controls`, `size` and `attrs`: every animated part is a `motion.*` element with `:variants="variants.<part>" initial="initial" :animate="controls"`. Copy the shape of an icon from the registry (`icons-lucide-bell`). Triggers are props: `animate-on-hover`, `animate-on-tap`, `animate-on-view`, `animate`, `loop`, `animation`; `AnimateIcon` around several icons and a label animates them together.

## Verify and review

- The type-check, before and after as in § Verify, is the project's own: `vue-tsc -b --force` when `tsconfig.json` only lists `references` (Vite's template: `vue-tsc --noEmit` on it checks nothing and always passes, and without `--force` build mode can skip a project its `tsbuildinfo` calls up to date), `vue-tsc --noEmit` otherwise, `nuxi typecheck` in Nuxt. The `build` or `type-check` script of `package.json` names it.
- The CLI's `audit` reads `.vue` files: their template's `motion.*` bindings, their scripts and their `<style>` blocks (`references/review.md` applies as written).
- Migrating from Animate UI v1 doesn't apply: v1 had no Vue.
