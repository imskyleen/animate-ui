# @animate-ui/cli

```bash
# Animate installed shadcn/ui components
pnpm dlx @animate-ui/cli@latest animate accordion
pnpm dlx @animate-ui/cli@latest animate all

# Migrate Animate UI v1 components to v2
pnpm dlx @animate-ui/cli@latest migrate all

# List what moves in a project, and how
pnpm dlx @animate-ui/cli@latest audit
```

Pass `--dry-run` to preview the changes.

`animate` only changes import sources, mirroring each library's style: `import { Accordion, Slot } from "radix-ui"` becomes `import { Accordion, Slot } from "@animate-ui/react/primitives/radix-ui"` (the barrel re-exports everything else from `radix-ui`), `@base-ui/react` moves to `@animate-ui/react/primitives/base-ui`, `react-aria-components` to `@animate-ui/react/primitives/react-aria`, and per-package imports (`@radix-ui/react-accordion`, `@base-ui/react/accordion`, `vaul`, `input-otp`, `embla-carousel-react`, `@shadcn/react/questionnaire`) to the matching per-primitive path (`@animate-ui/react/primitives/radix-ui/accordion`, `@animate-ui/react/primitives/carousel`, `@animate-ui/react/primitives/questionnaire`…). An import with nothing Animate UI animates is left alone. shadcn/ui's code block has no primitive import to swap: `animate code-block` rewrites it in place (its `pre` becomes `@animate-ui/react/primitives/code-block`'s `Content`, its copy button is built on the Copy Button), and leaves a part changed by hand as it is.

`migrate` moves every import it can to `@animate-ui/react`. In an import mixing mappable parts with v1-only ones (a highlight part, a context hook), the mappable parts move and the v1-only names stay on the v1 file, each reported as a manual step: once their parent is v2 they throw at runtime, so remove them or replace the component with shadcn/ui's + `animate-ui animate`. The v1 files v2 has no equivalent for (Files, Preview Link Card, the Headless UI primitives, a few hooks) stay yours and keep working: they stay on the v1 Radix UI and Base UI primitives they're built on. The Flip and Liquid buttons are registry files in v2: their imports stay on the v1 file too, and a manual step gives the `shadcn add` command for each.

At the end, `migrate` lists the v1 files `@animate-ui/react` replaces that nothing imports anymore. In a terminal it asks before deleting them (one by one, or all at once); `--delete` deletes them and `--keep` keeps them without asking. Outside a terminal (CI, piped) they're kept unless you pass `--delete`.

`audit` lists the animations of a project (or of the folders and files you pass): the properties each one changes and what they cost the browser, and the patterns worth a look (`transition: all`, ease-in entrances, long durations, hover scales, missing reduced-motion paths…). The Animate UI skill weighs these facts for you.

Documentation: https://animate-ui.com
