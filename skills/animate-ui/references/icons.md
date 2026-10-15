# Animated icons

Turn any icon into an Animate UI animated icon: from Lucide, Hugeicons, Tabler, Phosphor, Heroicons, an icon set's SVG or a hand-drawn one. The result works like the registry's icons: `animateOnHover`, `animateOnTap`, `animateOnView`, `animate`, `loop`, `speed`, inside `<AnimateIcon asChild>`, the automatic `path` and `path-loop` draws, `tempo` and reduced motion. First check the registry (catalog.md, § Icons): Lucide and Hugeicons already ship nearly 400 icons each. Any other icon, in any style, can be animated with the principles below.

Icons own their motion: their timings, `easeInOut` and springs are written by hand in the file, outside the tokens and the curve rules of `rules.md` (an icon playing on view isn't a surface's entrance). Reduced motion, `speed` and `tempo` still apply, through the core.

### Levels

Ask the level like any animation (SKILL.md § 3), with what each would do on this icon:

- **Subtle** (default): the icon's one meaningful motion, played once on its trigger, at the amplitudes below. This is the registry's level.
- **More**: a fuller gesture: the motion with its follow-through (a rumble before the lift, a wiggle after the pop, the flame flickering as the rocket rises), or its `-loop` version.
- **Expressive**: it keeps going or adds a moment: `loop` with a `loopDelay` while it's visible, a `draw` alternate before the gesture, or a burst of Particles (catalog) around it on a rare success.

"Subtle", "discret", "light" is the first level at the amplitudes below (don't shrink them further); "lively", "vivant", "really ring", "plus animé" the second (a ring gets more and longer swings: `[0, 20, -16, 13, -10, 7, -4, 2, 0]` over 1.2s); "in a loop", "en boucle", "all the time" the third.

## The file

One file per icon in the project's components folder, under `animate-ui/icons/<name>.tsx`: where `components.json`'s `components` alias points (the registry puts its icons there), else `components/` or `src/components/` like the project's other components. It imports the core from `@animate-ui/react/icons` (install `@animate-ui/react` and `motion` if missing, SKILL.md § 2).

```tsx
'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BellProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 20, -10, 10, -5, 3, 0],
        transformOrigin: 'top center',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    clapper: {
      initial: { x: 0 },
      animate: {
        x: [0, -6, 5, -5, 4, -3, 2, 0],
        transition: { duration: 1.1, ease: 'easeInOut' },
      },
    },
    body: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BellProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M10.268 21a2 2 0 0 0 3.464 0"
        variants={variants.clapper}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        variants={variants.body}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Bell(props: BellProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Bell,
  Bell as BellIcon,
  type BellProps,
  type BellProps as BellIconProps,
};
```

- `animations` has a `default`, and named alternates beside it, each `satisfies Record<string, Variants>`, the whole `as const`: `IconProps<keyof typeof animations>` types the `animation` prop from it.
- Each key is a piece, named for what it is (`lid`, `handset`, `slash`, `minute`), each with `initial` (rest) and `animate`. A piece that doesn't move in an animation is `{}`, still listed: `path` and `path-loop` draw every key of `default` except the ones named `group`, so a piece missing from `default` (or a plain `<path>`) won't draw.
- `group` moves the whole icon: on the `<motion.svg>`, or on a `<motion.g>` around the pieces that move together.
- Every piece is a `motion.*` element with `variants`, `initial="initial"` and `animate={controls}`. Keep `{...props}` on the svg and `IconWrapper` around it: the triggers, the parent `AnimateIcon`, `speed`, `tempo` and reduced motion all come through them.
- Write timings at speed 1: `getVariants` scales durations, delays and springs by `speed` and `tempo`. Under reduced motion the icon stays at rest; nothing to add.
- No comments in the file. Keep `'use client'`: it's harmless outside Next.js.
- `group` on the `<motion.svg>` moves the whole box and turns around the svg's center; on a `<motion.g>` it moves only the pieces inside, around their own box. Use a `motion.g` when the pivot belongs to the drawing or some pieces must stay still.
- Motion gives each SVG piece `transform-box: fill-box`: a `transformOrigin` on a piece is measured from that piece's own box, and a move (`x`, `y`) on a piece or a `motion.g` is in grid units.

## From another library

Take the icon's real SVG (the library's package source, its site's "copy SVG", or the `.svg` file) and keep its drawing exactly: the same `viewBox`, `d` values, stroke width, caps and joins, fill or stroke. Split it into pieces only to animate them; never reshape them.

- `stroke="currentColor"` and `fill="none"` for an outline set (Lucide, Tabler, Heroicons outline); `fill="currentColor"` on the svg or the pieces for a filled set (Phosphor fill, Heroicons solid). Caps and joins that differ per piece stay on the piece (Hugeicons).
- Another grid (Phosphor's `0 0 256 256`, a 20px set) keeps its `viewBox`: amplitudes below are for 24 units, scale them to the grid (×10.7 on 256).
- A filled outline drawn beside 2-wide strokes gets `fill="currentColor"` and `strokeWidth={0.5}` so it isn't thinner than them.
- `<line>`, `<circle>`, `<rect>`, `<polyline>` become `motion.line`, `motion.circle`… and can animate their own attributes (`x2`, `r`, `points`).
- Another grid's amplitudes: only distances (`x`, `y`, a `d` morph) scale with the grid; scales, rotations and percentages stay as they are.
- Name the component as the user calls the icon (their file name or their word), else the library's name (`ShoppingCart`, `Notification01` for Hugeicons' numbered names), and export it also as `<Name>Icon`.
- Replace the old usage (`<img src={rocket}>`, the library's component) with the new icon; leave the original file and its imports' type declarations in place, and say so in the output.
- An icon beside a label that says the same thing is decoration: `aria-hidden` on it (the props pass through to the svg). An icon that carries its own meaning (verified, error, new) takes `role="img"` and an `aria-label`. Alone in a button, the button takes the `aria-label`.
- Size it to where it sits: `size` defaults to 28; beside text, the text's size (16 for `text-sm` and `text-base`, 20 in a button).
- Pick the animation where the icon is used (`animation="draw"`); add a prop to the user's component for it only when they ask to switch it.

### The same icon in the registry

When the registry has the same object (a rocket, a bell, a bolt is Lucide's `zap`), start from its animation, adjusted to this drawing: read its source at `https://animate-ui.com/r/icons-lucide-<name>.json` or `https://animate-ui.com/r/icons-hugeicons-<name>.json` (the file's `content`), or the icon pages on animate-ui.com. Without network, design it from the principles below.

### Styles

The same principles hold for every style; what changes is how each is drawn.

- **Outline** (strokes on `fill="none"`: Lucide, Tabler, Heroicons outline, Iconoir): as above; `path` draws every stroke.
- **Thin or light weights**: the same motion; pieces are thinner, so a draw reads faster, keep the timing.
- **Solid** (one filled shape: Heroicons solid, Phosphor fill, Material filled): split the shape only where it already has separate subpaths (`M` commands) for the parts that move; a single shape moves whole (pop, swing, hop, turn). `pathLength` does nothing on a fill: `path` and `path-loop` won't draw it, so its `draw` becomes a reveal through a clip whose `rect` grows from 0 to the viewBox's size (256 here, 24 on a 24 grid; `useId()` for the clip's id, the `reveal` key listed in `default` as `{}`). A reveal grows, so `easeOut`. Upward, like a liquid rising, animate the rect's `attrY` and `height` (`y` on an SVG element is a transform, `attrY` the attribute):

  ```tsx
  draw: {
    group: {},
    reveal: {
      initial: { width: 256 },
      animate: { width: [0, 256], transition: { duration: 0.6, ease: 'easeOut' } },
    },
  },
  ```

  ```tsx
  <defs>
    <clipPath id={id}>
      <motion.rect x={0} y={0} height={256} variants={variants.reveal} initial="initial" animate={controls} />
    </clipPath>
  </defs>
  <motion.g clipPath={`url(#${id})`} variants={variants.group} initial="initial" animate={controls}>
    <path d="…" />
  </motion.g>
  ```

  - **A piece cut out of the shape** (a check or a mark punched through a badge, `fill-rule="evenodd"`) can't be split off: splitting it would fill it. Its `draw` covers the hole and erases the cover along the cut-out: a `path` with the hole's subpath filled in `currentColor`, masked by a white `rect` and a black stroke along the hole's centerline (as wide as the hole, round caps). The stroke draws `pathLength: [0, 1]` with `opacity` over the first 0.1s only, so the cut-out appears along its line. At rest the eraser is complete and the icon looks exactly like the original; `path` draws it too.
  - **A part fused into the outline** (a clapper drawn in the bell's contour) can't move alone: the whole icon carries the motion (the bell swings, longer, as the follow-through), and the drawing stays as it is.

- **Outline drawn as a fill** (Phosphor regular, Material outlined: a filled shape with the inside cut out): treat it as solid. Don't invent a filled version for a `fill` alternate; take the set's own solid icon if it ships one, else skip `fill`.
- **Duotone or bulk** (a pale layer behind the main drawing: Phosphor duotone, Hugeicons bulk, Font Awesome duotone): keep both layers and their opacity. The main layer carries the motion; the pale layer moves with it as one object, or fills in as a state: a copy of the pale layer's shape at full opacity rises through a clip (`attrY` and `height`, 0.6s `easeOut`) and drains back the same way.
- **Multicolor** (fixed colors, an illustrated set, a flag, a logo): keep every `fill` and `stroke` value; don't turn them into `currentColor`. Animate pieces, never their colors, unless the color is the meaning (a light turning on).
- **Pixel** (a grid of squares: Pixelarticons): moves land on whole pixels: step the ease by the pixels each segment covers (`x: [0, 4, 0]` steps by 4: `ease: (t) => Math.round(t * 4) / 4`); no blur, no scale below a pixel.
- **Icon fonts** (a glyph, not an SVG: Material Symbols font, Font Awesome webfont): there are no pieces. Use the set's SVG version when it has one; otherwise the whole glyph is the `group`, in a `motion.span` instead of the svg, and only the whole-icon motions apply.
- **Emoji or bitmap** icons: the whole image is the `group`; it can hop, swing, pop, never morph or draw.

## How an icon moves

The principles every registry icon follows:

- **It moves as it means.** The part that moves in real life moves; the rest stays still. A bell swings from its top while its clapper swings; a bin's lid lifts and its body opens below; a power button presses in (stem down 2, ring to 0.94); a tag swings from its hole; a handset rings; a folder's front swings down. An "off" icon (eye-off, mic-off) keeps the object still and draws only its slash.
- **Nothing vanishes, nothing doubles.** Every piece stays visible through the animation (a twinkle pulses, it doesn't disappear), and a piece landing on another lands exactly on it.
- **Two kinds of animation.**
  - A **state** (hover in, hover out): `animate` is one target, and `initial` carries the same transition so the way back animates too. An arrow moves `x: '25%'` in 0.3s, a chevron 4, a download arrow `y: 2`.
  - A **gesture** (a ring, a pop, a wiggle): keyframes that start and end at rest, `[0, 20, -10, 10, -5, 3, 0]`.
  - A gesture can end on a state: keyframes from rest to the held value (a rocket rumbles, then lifts and stays up while hovered), `initial` bringing it back.
  - The state's out-and-back version is the same name with `-loop` (`default-loop`, `pointing-loop`): `[0, '25%', 0]` in twice the time.
- **Damped swings.** Each swing smaller than the last, ending at rest: a bell `[0, 20, -10, 10, -5, 3, 0]`, a magnifier `[0, 17, -10, 5, -1, 0]` from `bottom right`, a tag `[0, 8, -6, 3, 0]`, a hop `y: [0, -2, 0, -0.8, 0]` with `times: [0, 0.3, 0.55, 0.75, 1]`.
- **A pop squashes first.** `scale: [1, 0.9, 1.2, 1]` over 0.6s on a shape with room around it (heart, star); a shape that fills the grid pops only as far as the grid allows (`[1, 0.92, 1.04, 1]` on a wallet): its largest frame, half the stroke included, stays inside.
- **Small amplitudes.** Moves of 0.5 to 4 units on the 24 grid (a rumble 0.3), wiggles of 3 to 20°, a squash or skew along one axis (`scaleY`, `skewX`) of 5% at most. Full turns only for what turns: 360° for a refresh (the way its arrow points), 60° for a snowflake, 90° for a plus or a cross, a gear `[0, 90, 180]` over 1.25s.
- **Inside the grid.** Every frame of every piece and `motion.g` stays inside the viewBox, half the stroke width included (a `group` on the `<motion.svg>` turns the whole box instead; nothing gets cut): an icon that would cross the edge moves less or shrinks a little while it moves (an hourglass turns 180° through `scale: [1, 0.75, 0.75, 1]`). A flight out (`out`) is the exception: `x: [0, '150%', '-150%', 0]` with `times: [0, 0.5, 0.5, 1]` leaves and comes back from the other side.
- **The right pivot.** Set `transformOrigin` on what swings or turns, from the piece's own box: `top center` for a bell, `bottom left` or `50% 100%` for what sways from its base (a flame, a droplet), `50% 0%` for a canopy, the lens' center for a magnifier's zoom. For a pivot fixed in the icon (a clock's center, a hinge), `style={{ transformBox: 'view-box' }}` with the origin in grid units (`'12px 12px'`).
- **Timing.** 0.6s for most gestures, 0.3s for a state, 0.2s for a blink, 0.4 to 0.8s for draws, 1 to 1.8s for oscillations and loaders. `easeInOut` almost everywhere; `easeOut` for what appears or grows; `linear` only for continuous spins. A spring (`{ type: 'spring', stiffness: 150, damping: 25 }`, 200/20 for a menu turning into a cross) where a piece should settle.
- **Drawing.** A check, a slash or an arrow's shaft draws with `pathLength: [0, 1]` and `opacity: [0, 1]` in 0.4 to 0.6s; repeated rays draw one after the other, 0.15s apart.
- **Waves pulse.** Wifi, sound or signal waves pulse by default (`opacity: [1, 0.25, 1]`, `scale: [1, 0.85, 1]`, 0.5s, 0.15s apart), never fully gone; a `blink` alternate takes them out and back.
- **Clocks.** The minute hand goes round once, the hour hand steps forward and back (`[0, 20, 0]`), both around the clock's center.
- **Loops.** A loader spins `repeat: Infinity` linear in 1s, or fades its segments with negative delays (`-(k * duration) / count`) so it's already running when it mounts.
- **Morphing a path.** Animate `d` only between strings with the same commands and the same number of values, written the same way (`M19 6v14…` → `M19 8v12…`), kept as constants (`OPEN_LID`, `CLOSED_LID`); otherwise the path breaks mid-way. A line's ends morph through `x1`, `y1`, `x2`, `y2`.
- **Filled states.** A `fill` alternate fades an outline's `fillOpacity` from 0 to 1 (with `fill: 'currentColor'`), starting 0.2s into the icon's gesture; a duotone's pale layer rises instead (§ Styles).
- **Alternates.** Name them for what they do: `fill`, `blink`, `pulse`, `draw`, `out`, `pointing`, `rotate`, `tilt`, `wiggle`, `look`, `open`, `lock`, `unlock`, `off`. Icons from two libraries that show the same thing share the same animations, adjusted to each drawing.
- **It returns to rest.** Stopped midway (hover left early), every piece goes back to `initial`.

## A state from the app

A state that comes from data rather than a gesture (unread notifications fill the bell, a saved item stays filled) can't go through `controls`: one animation plays at a time, and the hover ring must still play. Give the icon a prop and animate it on its own:

- Type it beside the icon's props: `type BellProps = IconProps<keyof typeof animations> & { filled?: boolean }`, read it in `IconComponent`, and pass it through `IconWrapper` like the others.
- Animate it with `animate={…}` and `initial={false}` (a page loaded with the state on shows it, no replay), its transition through `useTempoTransition()` and `useShouldReduceMotion()` from `@animate-ui/react/utils/motion`: under reduced motion it fades instead of rising or moving. `speed` doesn't reach it.

## Triggers

- On the icon: `animateOnHover`, `animateOnTap`, `animateOnView` (once by default; `animateOnViewOnce={false}` replays each time it comes back, `animateOnViewMargin` starts it earlier or later), `animate`.
- From a parent: `<AnimateIcon animateOnHover asChild>` around a button or a card, so the whole target triggers it.
- Played on view, the icon starts as it touches the viewport; its `initial` stays the rest state (a draw doesn't start hidden), so under reduced motion or before the trigger it shows whole.
- Inside something that has its own entrance (a card fading in), `delay` by about that entrance's length so the icon plays once it's there.

## Verify

- The type-check passes; `<Name animateOnHover />` and `<AnimateIcon animateOnHover asChild><button><Name /> Label</button></AnimateIcon>` both animate, and each named animation plays with `animation="…"`.
- `animation="path"` draws every stroke and the icon rests solid after it (outline icons; a solid icon has its reveal instead).
- Mid-animation, nothing leaves the viewBox, disappears, doubles or changes thickness; stopped midway, it settles back at rest.
- Without a browser, say so, and check by reading: every piece in `default`, `{...props}` and `IconWrapper` kept, the drawing's values unchanged.
