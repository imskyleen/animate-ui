# Route change (page transitions)

The change from one page of an app to the next. Not a page's own entrance (that's [page.md](page.md)): this is the old page leaving while the new one arrives. Use Animate UI's Page Transition, a registry file built on view transitions; don't hand-build one with `AnimatePresence` around the router outlet.

## Install

Pick the file from the router in `package.json`; each one lands in `components/animate-ui/components/page-transition.tsx`:

| Router                                                | Registry item                                |
| ----------------------------------------------------- | -------------------------------------------- |
| `next` (App Router; the Pages Router isn't supported) | `components-page-transition`                 |
| `react-router`                                        | `components-page-transition-react-router`    |
| `@tanstack/react-router`                              | `components-page-transition-tanstack-router` |

The `@animate-ui` registry must be in `components.json` first (`"registries": { "@animate-ui": "https://animate-ui.com/r/{name}.json" }`; a fresh shadcn project has `"registries": {}`), then `<dlx> shadcn@latest add @animate-ui/<item>`. It needs React 19.3 or later (`react` and `react-dom`): on an older React, say so and ask before upgrading, don't install it. Browsers without view transitions change pages at once.

## Wire it

Wrap the content that changes, in the layout, so the header and navigation around it stay still: `{children}` in Next's `app/layout.tsx`, `<Outlet />` in React Router's root or TanStack Router's `__root.tsx`. TanStack Router also needs `defaultViewTransition: true` in `createRouter`.

```tsx
<Header />
<PageTransition effect="slide">{children}</PageTransition>
```

The wrapper is a `div`: give it the layout's classes (`className`) when it sits in a grid or flex layout, so the page keeps its place.

- **Effect, by level**: subtle → `fade` or `slide`; more → `stack`, `push`, `zoom` or `flow`; expressive → `iris`, `wipe`, `bands`, `chop`, or `random` (another effect at each navigation). An app or docs takes a subtle or "more" one; `iris` and the cuts suit a marketing site or a portfolio.
- **Direction**: links play forward, no type needed (`nav-forward` exists but changes nothing). Links that go back get the `nav-back` type: Next `<Link transitionTypes={['nav-back']}>`, TanStack `<Link viewTransition={{ types: ['nav-back'] }}>`, React Router `startTransition(() => { addTransitionType('nav-back'); navigate(to); })`. Breadcrumbs, "back to the list" and a previous-page arrow go back; the header's links (Home included) and the browser's own buttons don't get a type.
- **One effect for one navigation**: a type named after an effect plays it for that navigation (`transitionTypes={['push']}`), and with `nav-back` it plays mirrored (`['curtain', 'nav-back']`), e.g. tabs that switch between views of a page pushing sideways while the site stacks.
- **No transition for one navigation** (the same page in another variant, a filter in the URL): with TanStack Router, `viewTransition={false}` on those links. With Next.js and React Router, give the wrapper a `pageKey` that stays the same across those URLs (the pathname without the variant segment), and tag those links with a type, say `still`, killing the browser's default crossfade in the global CSS:

  ```css
  :root:active-view-transition-type(still)::view-transition-group(*),
  :root:active-view-transition-type(still)::view-transition-old(*),
  :root:active-view-transition-type(still)::view-transition-new(*) {
    animation: none;
  }
  ```

- **Shared elements**: an element on both pages (a card's cover becoming the page header) morphs with `PageTransitionShared`, the same `name` on both pages and unique on each: ``<PageTransitionShared name={`cover-${post.id}`} className="h-20 rounded-lg bg-primary" />``.
- **Other view transitions on the same pages** (a Theme Toggler's wipe, the app's own): the file's root rules (the old page hidden, the new one still) only apply while a page change runs (`data-page-transition` on `<html>`, set when its effect starts, removed when the transition ends), so a theme wipe still crosses the old page. A wipe across the whole page starts its transition with a type and unnames everything below `body` for it (`:root:active-view-transition-type(<type>) body *{view-transition-name:none !important}`), or a named header crossfades on its own instead of being wiped.
- `pageKey` (Next.js and React Router) also replaces the pathname when what identifies a page isn't the URL (a client-side wizard, tabs in state).

Facts to state in the output when they matter: the browser's back button doesn't animate with Next.js and React Router (React renders history navigations at once), TanStack Router animates it forward; a view transition isn't interruptible, a click during one waits for it; under reduced motion every effect becomes the crossfade.

## A new effect

Asked for an effect the file doesn't have ("a page that folds", "a curtain"): add it to the installed file, the way its ten are written. Don't wrap or fork the component.

1. Add the name to the `PageTransitionEffect` union. `random` picks from `EFFECTS`, so it includes the new one by itself.
2. Add an entry to `EFFECTS`: `(back, enter, exit) => ({ enter, exit })`. `enter` and `exit` are Motion targets for the new and the old page (keyframe arrays, from → to, each with its `transition`). The function's `enter` and `exit` arguments are the `Frame` of each page: `width`, then `top` and `bottom` of the part on screen in the page's own pixels, and `x`, `y` the click (the middle of the visible part on a keyboard navigation).
3. Work on the visible part, never the whole page: vertical distances and clip shapes in pixels from the frame (`translateY(${enter.bottom - enter.top}px)`, `polygon(0% ${top}px, …)`), a scale around `transformOrigin: [middle(frame), middle(frame)]`, a circle sized to the farthest visible corner from `x`, `y`. Percentages are fine horizontally (`translateX(100%)`), never vertically: a page taller than the screen would move off screen or around a center no one sees.
4. Animate `transform`, `opacity`, `filter` and `clip-path` only. A page that fades or slides a little into place (`fade`, `slide`, `zoom`) enters on `ease.out` and its exit is quicker, on `ease.leave`. A page that travels over the old one (`stack`, a curtain, a cover) or reveals itself (a clip, a wipe) takes `ease.resize`, the old page on the same duration. Two pages moving as one (`push`) take `ease.inOut`, the same duration for both. Between 0.3s and 0.7s, since nobody can click until it ends: 0.3–0.4s for a fade or a short slide, 0.5–0.6s for a page crossing the whole screen, 0.7s only for a shape drawn in steps.
5. When the new page covers the old one, sliding over it (a curtain, a cover) or uncovering itself (a clip, a wipe), the old page stays put underneath with `exit: still(duration)` for the same duration. A shape that moves in several steps is a keyframe array with `ease: 'linear'`, its easing baked into the frames (see `bandFrames`).
6. Mirror it for `back`: the new page comes from the opposite side (right → left, top → bottom), the old page moving the other way when it moves. The new page is always drawn above the old one, so a back can't lift the old page off: mirror the direction, don't invert the roles.

Check it forward and back, by click and by keyboard, at the top and scrolled down a page taller than the screen, in both themes, and under reduced motion (the crossfade, not the new effect).
