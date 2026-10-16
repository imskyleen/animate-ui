# Card (clickable card, tile, list row)

Imports and base-library wiring: [README.md](README.md).

Purpose: feedback. A surface the pointer rests on before choosing it.

```tsx
// Rendered inside ReducedMotionConfig (around the grid).
function ProductCard({ product }: { product: Product }) {
  const reduce = useShouldReduceMotion();
  const { spring, scale } = useMotionTokens();
  const pressed = reduce ? 'scale(1)' : `scale(${scale.choice})`;

  return (
    <motion.button
      type="button"
      initial={{ transform: 'scale(1)' }}
      whileTap={{ transform: pressed }}
      transition={spring.press}
      className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <img
        src={product.image}
        alt=""
        className="aspect-square w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="p-4">{product.name}</div>
    </motion.button>
  );
}
```

- Pressed, the whole card scales to `scale.choice` (0.985): it's large, so lighter than a button's 0.97.
- `initial={{ transform: 'scale(1)' }}` isn't decoration: without a resting transform, Motion would start the press from `scale(0)`.
- Hovered, it never scales: its shadow deepens (`transition-shadow`), its image zooms to 1.05 inside it (clipped by `overflow-hidden`), and it may lift 2px (`hover:-translate-y-0.5`, 4px at most). Under Tailwind v4 the lift is the `translate` property and composes with the press's `transform`; under v3 (or when the version is unknown) put the lift on a wrapper around the card instead. Use Tailwind's `hover:`/`group-hover:` (v4 gates them to hover-capable pointers; on v3, wrap them in `@media (hover: hover) and (pointer: fine)`), or Motion's `whileHover` on `spring.highlight`, which ignores touch. Keep the card's resting look and add only the hover state; without a Motion press, the lift needs no wrapper. When the version is unknown, transition `transform` and `translate` by name, gate hover with `[@media(hover:hover)_and_(pointer:fine)]:hover:`, and give a hover border an explicit color.
- Under reduced motion the zoom and the lift go, the shadow stays.
- A row in a list (settings, files) takes the same press and a background change on hover, no lift.
