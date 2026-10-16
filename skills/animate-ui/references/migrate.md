# Migrate an Animate UI v1 project

```bash
pnpm add @animate-ui/react motion
pnpm dlx @animate-ui/cli@latest migrate all --dry-run
pnpm dlx @animate-ui/cli@latest migrate all
```

Dependencies: v1's Base UI primitives were built on Base UI's beta (`@base-ui-components/react`), v2's on Base UI 1, so a project using them adds `@base-ui/react` `^1.8.0` (the CLI says so) and removes the beta once nothing imports it; the same goes for `@headlessui/react` once its components are rebuilt.

It rewrites imports of the copied v1 primitives, icon core and libs to `@animate-ui/react`, maps v1 export names to the v2 parts, and lists manual steps (v1-only props, Headless UI primitives, which v2 doesn't support). The migration is partial where it must be: in an import mixing mappable parts with v1-only ones (`DropdownMenuHighlight`, context hooks like `useAccordionItem`), the mappable parts move to v2 and the v1-only names stay imported from the v1 file, each with a manual step. Those read v1's context, so they throw at runtime once their parent is v2: remove them (v2 parts animate themselves; use `data-state` attributes or controlled state). v1's styled components stay; swap one for shadcn/ui's + `animate-ui animate` only when asked. An "upgrade" request does every manual step it can, then deletes the v1 files those steps made unused once nothing imports them, and names them in the output. Common cases:

- `useAccordionItem()` to know whether an item is open: control the accordion (`value`/`onValueChange`) and compare, or style the item with `data-[state=open]:` classes.
- `DropdownMenuHighlight` / `DropdownMenuHighlightItem`: drop them and give the items their own background (`focus:bg-accent`, as shadcn/ui's do); v2's highlight glides behind them and takes that background.
- An `activeClassName` (v1's highlight color) becomes the item's own `focus:` classes (`focus:bg-accent focus:text-accent-foreground`; a destructive item: `data-[variant=destructive]:focus:bg-destructive/10`), and a SubTrigger takes `data-[state=open]:bg-accent` so it stays lit while its submenu is open.
- A styled Content or SubContent that took a `container` prop passes it to its Portal.
- Headless UI primitives (v2 doesn't support them): rebuild them on Base UI, on the matching part (a Disclosure on `Collapsible` from `@animate-ui/react/primitives/base-ui/collapsible`: `DisclosureButton` → `Collapsible.Trigger`, `DisclosurePanel` → `Collapsible.Panel`; a Menu on `Menu`, a Dialog on `Dialog`).
- A v1 part given a Motion prop (`initial`, `animate`, `layoutId`) that v2's part doesn't take: drop it, v2's part animates itself; a glide a `layoutId` drew (a tab or item indicator) is replaced by v2's own indicator.
- A hand-typed `transition` on a v2 part stays, and is named in the output: it doesn't follow `tempo`.
- A child reading its parent's state after `useAccordionItem()` goes: `group` on the parent, `group-data-[state=open]:` on the child.
- A v1 sheet positioned by its own inline styles: v2's slides from its `data-side` but doesn't position it, so add the edge classes (`fixed inset-y-0 right-0`, `left-0`, `inset-x-0 top-0`, `bottom-0`).

At the end it lists the v1 files `@animate-ui/react` replaces that nothing imports anymore (and the ones still imported, by what). In a terminal it asks about each one (delete it, delete it and all the others, keep it, keep them all); `--delete` deletes them all and `--keep` keeps them all without asking. Non-interactive runs (CI, an agent's shell) keep them: pass `--delete` once the manual steps are done. It only removes the files `@animate-ui/react` replaces; v1 files a manual step made unused (a Headless UI primitive you rebuilt) are deleted by hand after checking nothing imports them (on an "upgrade" request, do it and name them); a rerun of `migrate` lists the ones `@animate-ui/react` replaces.

Remove the old packages from `package.json` once nothing imports them. Check: the type-check passes with no new error; say in the output the type-check before and after (errors already there named as such) and what changed in `package.json` (`motion` 12 → 14, `@base-ui/react` added).
