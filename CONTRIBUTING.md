# Contributing

Thanks for your interest in contributing to Animate UI! Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

## What to contribute

Contributions are most welcome for:

- Bug fixes, with a test that reproduces the bug.
- Accessibility, performance and reduced-motion improvements.
- Fixes and improvements to the CLI.
- Documentation fixes: typos, wrong props, broken links, unclear explanations.

## Requests for new components

If you have a request for a new component, primitive, icon or background, please [open a discussion on GitHub](https://github.com/imskyleen/animate-ui/discussions). We'll be happy to help you out.

What Animate UI adds is decided in discussions first, so please don't open a pull request for a new component that hasn't been agreed on there: it will be closed.

## About this repository

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [workspaces](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.

Animate UI v1 lives in `apps/v1` as its own project, with its own lockfile. It is frozen: changes go to v2 only.

## Structure

```
apps
├── v1                # Animate UI v1 (frozen)
└── v2                # The website and the docs
    ├── content/docs  # The documentation (MDX)
    ├── demos         # The demos shown in the docs
    ├── registry      # The shadcn registry: icons, hugeicons, backgrounds
    └── tests         # Playwright tests
packages
├── react             # @animate-ui/react: the animated primitives
├── cli               # @animate-ui/cli: the animate, migrate and audit commands
├── eslint-config
└── typescript-config
skills
└── animate-ui        # The Animate UI skill for AI assistants
```

| Path                   | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `packages/react/src`   | The primitives: Radix UI, Base UI, React Aria and our own.                     |
| `packages/cli/src`     | The CLI that animates shadcn/ui components, migrates v1 and audits animations. |
| `apps/v2/registry`     | The icons (Lucide and Hugeicons) and the backgrounds.                          |
| `apps/v2/content/docs` | The documentation.                                                             |

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/animate-ui.git
```

### Navigate to project directory

```bash
cd animate-ui
```

### Create a new branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

### Run the docs

```bash
pnpm --filter=v2 dev
```

## Fixing a bug

1. Reproduce the bug in a test that fails without your fix: a Playwright test in `apps/v2/tests` for a primitive, an icon or the docs, a Vitest test in `packages/cli/test` for the CLI.
2. Fix it, and check that the test passes.
3. Many primitives share their mechanism across Radix UI, Base UI and React Aria. If the bug comes from a shared mechanism, fix it in every primitive that uses it.

## Primitives

The primitives in `packages/react` are drop-in replacements: they keep the API, the DOM and the data attributes of the library they animate, so shadcn/ui's styles keep working.

When adding or modifying a primitive, please ensure that:

1. Its API stays the same as the library it animates.
2. It respects reduced motion.
3. It uses the motion tokens from `packages/react/src/utils/motion`.
4. Its documentation page and its demo are up to date.

## Icons

Icons animate [Lucide](https://lucide.dev/icons) and [Hugeicons](https://hugeicons.com) icons. Each icon is a folder in `apps/v2/registry/icons` (Lucide) or `apps/v2/registry/hugeicons` (Hugeicons), with an `index.tsx` and a `meta.json`.

When adding or modifying an icon, please ensure that:

1. Its drawing is the library's own, unmodified (Hugeicons with `strokeWidth={2}`).
2. Every animation stays within the 24×24 grid.
3. Its `meta.json` uses the library's categories.
4. An icon in both libraries offers the same animations in both.
5. You run `pnpm registry:build` to rebuild the registry.

## CLI

The CLI lives in `packages/cli`. Its documentation is [here](https://animate-ui.com/docs/cli).

Please add tests for your changes in `packages/cli/test`.

## Documentation

The documentation lives in `apps/v2/content/docs`. Run it locally with:

```bash
pnpm --filter=v2 dev
```

## Commit convention

Before you create a pull request, please check that your commits follow the [Conventional Commits](https://www.conventionalcommits.org/) convention used in this repository:

`category(scope): message`

- `feat`: a new feature
- `fix`: a bug fix (reference an issue if there is one)
- `refactor`: a code change that is neither a bug fix nor a feature
- `docs`: documentation changes
- `test`: adding or changing tests
- `build`: changes to the build, the CI or the dependencies
- `chore`: anything else

e.g. `fix(react): keep the tooltip open while hovering its content`

## Testing

Run the Playwright tests of the docs, the primitives and the icons:

```bash
pnpm --filter=v2 test
```

Run the CLI tests:

```bash
pnpm --filter=@animate-ui/cli test
```

Please ensure the tests pass when submitting a pull request.

## Ask for help

If you have a question, please [open a discussion on GitHub](https://github.com/imskyleen/animate-ui/discussions). We're here to help!
