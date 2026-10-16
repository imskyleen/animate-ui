# Page (hero, sections, feature grids, stats)

Imports and base-library wiring: [README.md](README.md).

Purpose: delight on arrival, continuity while scrolling. Start from the catalog (`../catalog.md`). What this recipe says "may" do is applied only when asked:

- The hero's main heading is there on first paint, unanimated: it's what a reader (and a crawler) needs first. Its subtitle and buttons may come in after it, one after the other: `Effects` (fade + blur + slide) with `holdDelay={100}` on load. Effect's defaults are made for showcases (a 100px slide, a 10px blur): on a page, set `slide={{ offset: 16 }}` and `blur={{ initialBlur: 2 }}` for lines of text (`initialBlur: 4` for cards). `Effects` wraps each child in an element of its own; pass `asChild` inside a grid or a flex row so the children stay the layout's items.
- Sections below the fold come in as they scroll into view: the same components with `inView` (once by default).
- Stats count up with `CountingNumber` (`inView`); it shows its value at once under reduced motion and screen readers read the value, never the ticking.
- A counted number gets `tabular-nums`, so its width doesn't jitter while it counts. Match the original's formatting with `thousandSeparator` (`","`), `decimalPlaces` and `decimalSeparator`, and keep units (`%`, `+`, `k`, `$`) as plain text beside it. A value that reads wrong counted from 0 (99.9%, a 4.8 rating, a year) starts near it with `fromNumber` (99.9 from 90, 2024 from 2000). A counted stat needs no entrance of its own: the count is its motion.
- These primitives are client components already: a server page can use them and stay a server component.
- Buttons press (`Button` from the catalog, or [press.md](press.md)); headings may use a text effect from the catalog, one per page at most.

By hand, the same values: fade on `transition.reveal`, rise a few pixels (16px at most) on `spring.entrance`, out of `blur.icon` for lines of text or `blur.surface` for cards, 80–100ms between items, `whileInView` with `viewport={{ once: true }}`. Keep the page's main text visible in the server HTML: animate decorations and what's below the fold, not the first line a reader needs.

- `Effects` with `inView` also works for what's already visible on load. A long list revealed on scroll staggers within each view, not by its index. A static card that scaled on hover gets no hover at all.
