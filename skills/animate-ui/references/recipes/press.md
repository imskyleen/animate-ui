# Press (Button, Toggle, Checkbox, Switch, Radio)

Imports and base-library wiring: [README.md](README.md).

Purpose: feedback.

- Press: ``whileTap={{ transform: `scale(${scale.press})` }}`` (0.97) on `spring.press`. Write the resting `transform: 'scale(1)'` in `initial`: Motion can only interpolate a missing transform from `scale(0)`. No hover scale. Under reduced motion, press to `scale(1)` (``const pressed = reduce ? 'scale(1)' : `scale(${scale.press})` ``): the color change still answers.
- Switch: the thumb stretches toward the middle of the track while pressed (×19/16 of its width) and glides to its side on `spring.thumb`; the track color changes at once.
- Checkbox: the box doesn't scale; it answers at once with its fill (in the demos, a `before:` layer that grows from 70% as it fades in over 300ms, CSS in the classes, so it's nearly full when the check starts; the layer covers the border, `before:-inset-px`, and the border keeps its color, or an outline rings the growing fill); the check draws itself (stroke and opacity together) on `transition.check` (0.3s after 0.2s, `ease.draw`) and erases on `transition.uncheck` (0.3s, `ease.draw`); with `checkAnimation="pop"`, it pops in after the same 0.2s on `spring.checkPop` and out on `transition.popOut`. Only checking and unchecking animate: a box already checked when it mounts (the page loading, a dialog opening) shows its check at rest, as the server rendered it.
- Radio: the dot pops in from 0 on `spring.bounce` and out the same way, when the selection changes; a radio already selected when it mounts shows its dot at rest. Its fill grows like the checkbox's: in the demos, a `before:` layer that grows from 70% as it fades in over 300ms (and shrinks back as it fades out), covering the border, which keeps its color.
- When Base UI renders the control as a `<button>`, pass `nativeButton`. React Aria controls expose their state through render props: put `ReducedMotionConfig` outside the primitive so the root's motion element is covered too.
