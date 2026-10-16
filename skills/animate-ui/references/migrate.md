# Migrate an Animate UI v1 project

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
