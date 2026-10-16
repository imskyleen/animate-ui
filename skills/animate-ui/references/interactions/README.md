# Interactions

Recipes for interactions people ask for by name ("make me a loading button", "animate my list") that aren't a component to install. Check `../catalog.md` first; then start from the matching recipe here, keep the user's markup and styles, and change only what moves. The recipes' colors (`bg-white`, `neutral-*`) and sizes are placeholders: use the project's own (its theme tokens, its dark mode). The distances and scales a recipe writes by hand (an 8px rise, a 0.96 exit) are part of the recipe: keep them. Every recipe compiles as written, uses the tokens through `useTempoTransition()`, and keeps a reduced-motion path. Overlays, menus and controls built on a library are in `../recipes/`.

One file per interaction; read only the one you need:

- [Status button (loading, success, error)](status-button.md)
- [A list: items in, out, and the gap closing](list.md)
- [A list reordered by drag](reorder.md)
- [A card that opens into a larger view](expanding-card.md)
- [Skeleton, then content](skeleton.md)
- [A badge counting](count-badge.md)
- [A field in error](field-error.md)
- [A row swiped away](swipe-row.md)
- [A grid filtered or sorted](filter-grid.md)
- [Steps of a form](form-steps.md)
- [A banner pushing the page](banner.md)
