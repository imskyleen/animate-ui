# What Animate UI already ships

Check this list before writing motion by hand: when one of these does the job, use it instead of rebuilding it. Primitives come with `@animate-ui/react` (no extra install). Backgrounds, icons and a few styled buttons are files added to the project with the shadcn CLI, from the `@animate-ui` registry (`"registries": { "@animate-ui": "https://animate-ui.com/r/{name}.json" }` in `components.json`). Each one's page on animate-ui.com shows its props; without network, read them from the package's types: `node_modules/@animate-ui/react/dist/primitives/<path>/index.d.ts`.

## Entrances and scroll

| Need                                                   | Use                                                                                        | Import                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Fade elements in on load or when they scroll into view | Fade                                                                                       | `@animate-ui/react/primitives/effects/fade`        |
| Slide them into place                                  | Slide                                                                                      | `@animate-ui/react/primitives/effects/slide`       |
| Bring them into focus out of a blur                    | Blur                                                                                       | `@animate-ui/react/primitives/effects/blur`        |
| Scale them up into place                               | Zoom                                                                                       | `@animate-ui/react/primitives/effects/zoom`        |
| Any mix of fade, blur, slide and zoom, staggered       | `Effect` (one element), `Effects` (its children one after the other, `holdDelay` ms apart) | `@animate-ui/react/primitives/effects/effect`      |
| Text coming in by character, word or line              | Splitting Text                                                                             | `@animate-ui/react/primitives/texts/splitting`     |
| Text typed out, with a cursor                          | Typing Text                                                                                | `@animate-ui/react/primitives/texts/typing`        |
| A scroll container whose edges fade where there's more | Scroll Fade                                                                                | `@animate-ui/react/primitives/effects/scroll-fade` |
| A bar following the scroll position                    | Scroll Progress                                                                            | `@animate-ui/react/primitives/scroll-progress`     |
| A container whose height follows its content           | Auto Height                                                                                | `@animate-ui/react/primitives/effects/auto-height` |

## Numbers and changing text

Counting Number for stats and Rotating Text for words cycling on a timer fit every level; only a value changing in place after an action swaps at the subtle level (`recipes/swap.md`). Rotating Text and Scrolling Number render a `<div>`: in a heading or a line of text, Rotating Text takes `align` with `style={{ display: 'inline-block', overflow: 'clip' }}` (`recipes/swap.md`, a word cycling in a line); give Scrolling Number `inline-block align-bottom`; check the baseline. Rotating Text plays its first word on mount: say so in the output when it sits in the first viewport.

| Need                                                                                             | Use              | Import                                                |
| ------------------------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------------- |
| A number counting up to its value (stats, totals)                                                | Counting Number  | `@animate-ui/react/primitives/texts/counting-number`  |
| Digits rolling to a new value, like an odometer                                                  | Sliding Number   | `@animate-ui/react/primitives/texts/sliding-number`   |
| A wheel of numbers settling on a value                                                           | Scrolling Number | `@animate-ui/react/primitives/texts/scrolling-number` |
| Words taking turns in place (inside a line of text: `recipes/swap.md`, a word cycling in a line) | Rotating Text    | `@animate-ui/react/primitives/texts/rotating`         |
| One string morphing into the next                                                                | Morphing Text    | `@animate-ui/react/primitives/texts/morphing`         |
| Letters rolling over, like a flip board                                                          | Rolling Text     | `@animate-ui/react/primitives/texts/rolling`          |
| A link or button label sliding out as a copy slides in, on hover or click                        | Sliding Text     | `@animate-ui/react/primitives/texts/sliding`          |
| A highlighter sweep behind text                                                                  | Highlight Text   | `@animate-ui/react/primitives/texts/highlight`        |
| A glint running across text                                                                      | Shimmering Text  | `@animate-ui/react/primitives/texts/shimmering`       |
| A gradient sweeping across text                                                                  | Gradient Text    | `@animate-ui/react/primitives/texts/gradient`         |

## Buttons and feedback

| Need                                               | Use                                 | Import                                                                                                                                   |
| -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A button that presses down                         | Button                              | `@animate-ui/react/primitives/buttons/button`                                                                                            |
| Copy to clipboard, icon swapping for a check       | Copy Button                         | `@animate-ui/react/primitives/buttons/copy`                                                                                              |
| A like or favorite that bursts                     | Icon Button                         | `@animate-ui/react/primitives/buttons/icon`                                                                                              |
| A button showing loading, success, error           | `interactions/status-button.md`     |                                                                                                                                          |
| A burst of particles around anything               | Particles                           | `@animate-ui/react/primitives/effects/particles`                                                                                         |
| A ripple from the click point                      | Ripple Button                       | `@animate-ui/react/primitives/buttons/ripple`                                                                                            |
| A fill rising on hover                             | Liquid Button                       | registry `buttons-liquid` → `@/components/animate-ui/buttons/liquid`                                                                     |
| A button flipping to its back face                 | Flip Button                         | registry `buttons-flip` → `@/components/animate-ui/buttons/flip`                                                                         |
| A theme switch (button, or a wipe across the page) | Theme Toggler Button, Theme Toggler | registry `buttons-theme-toggler` → `@/components/animate-ui/buttons/theme-toggler`, `@animate-ui/react/primitives/effects/theme-toggler` |
| A visual effect where the pointer clicks           | Click                               | `@animate-ui/react/primitives/effects/click`                                                                                             |
| A light sweeping across an element                 | Shine                               | `@animate-ui/react/primitives/effects/shine`                                                                                             |
| Loading and status dots                            | Motion Grid                         | `@animate-ui/react/primitives/motion-grid`                                                                                               |

Icon Button: render the particles only while liked, aim them at the icon (`side`, `sideOffset`) and color them with a `text-*` class. A label toggling between two words beside it is Morphing Text, with a `min-width` for the longer word.

## Pointer and layout

| Need                                                                  | Use                               | Import                                                                                                                        |
| --------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| One background gliding between items (nav, lists, segmented controls) | Highlight                         | `@animate-ui/react/primitives/effects/highlight`                                                                              |
| Tabs with a gliding highlight and sliding panels                      | Tabs                              | `@animate-ui/react/primitives/tabs`                                                                                           |
| Tooltips sharing one popup that moves between triggers                | Tooltip                           | `@animate-ui/react/primitives/tooltip`                                                                                        |
| Overlapping avatars, the hovered one rising                           | Avatar Group                      | `@animate-ui/react/primitives/avatar-group`                                                                                   |
| Items gliding between a pinned and an unpinned group                  | Pinned List                       | `@animate-ui/react/primitives/pinned-list`                                                                                    |
| A card tilting toward the pointer                                     | Tilt                              | `@animate-ui/react/primitives/effects/tilt`                                                                                   |
| An element pulled toward the pointer                                  | Magnetic                          | `@animate-ui/react/primitives/effects/magnetic`                                                                               |
| An image zooming where the pointer is                                 | Image Zoom                        | `@animate-ui/react/primitives/effects/image-zoom`                                                                             |
| A custom cursor or a label following it                               | Cursor                            | `@animate-ui/react/primitives/cursor`                                                                                         |
| A draggable element pulled back by a spring                           | Spring                            | `@animate-ui/react/primitives/spring`                                                                                         |
| A code block that can type itself out                                 | Code Block                        | `@animate-ui/react/primitives/code-block`                                                                                     |
| A one-time code input (drop-in for `input-otp`)                       | Input OTP                         | `@animate-ui/react/primitives/input-otp`                                                                                      |
| A repository's GitHub stars, counted up                               | GitHub Stars, GitHub Stars Button | `@animate-ui/react/primitives/github-stars`, registry `buttons-github-stars` → `@/components/animate-ui/buttons/github-stars` |

## Buttons (registry files)

Liquid Button, Flip Button, Theme Toggler Button and GitHub Stars Button are styled files, not package exports: add them with `<dlx> shadcn@latest add @animate-ui/buttons-<name>` (`liquid`, `flip`, `theme-toggler`, `github-stars`); they land in `components/animate-ui/buttons/` and take `variant` and `size` where their page lists them.

## Backgrounds (registry files)

Add with `<dlx> shadcn@latest add @animate-ui/backgrounds-<name>`; they land in `components/animate-ui/backgrounds/`.

| Name            | Look                                                            |
| --------------- | --------------------------------------------------------------- |
| `bubble`        | Soft gradient bubbles, following the pointer when `interactive` |
| `gradient`      | A slow shifting gradient                                        |
| `stars`         | Drifting dots of varying size and speed                         |
| `gravity-stars` | Dots drawn toward the pointer                                   |
| `hexagon`       | A hexagon grid lighting up under the pointer                    |
| `hole`          | A tunnel of rings with rising particles                         |
| `fireworks`     | Fireworks bursting across the area                              |

## Icons (registry files)

Animated Lucide icons and Hugeicons: `<dlx> shadcn@latest add @animate-ui/icons-lucide-<name>` or `@animate-ui/icons-hugeicons-<name>` (the icon pages on animate-ui.com list every name and animation). Each icon is a file in `components/animate-ui/icons/` (Hugeicons in `components/animate-ui/icons/hugeicons/`), animated by `@animate-ui/react/icons`: `animateOnHover`, `animateOnTap`, `animateOnView`, or `animate`; wrap a button in `<AnimateIcon animateOnHover asChild>` so hovering the whole button animates its icon. An icon that isn't there, or from another library: make it with `icons.md`.
