# @animate-ui/cli

```bash
# Animate installed shadcn/ui components
pnpm dlx @animate-ui/cli@latest animate accordion
pnpm dlx @animate-ui/cli@latest animate all

# Migrate Animate UI v1 components to v2
pnpm dlx @animate-ui/cli@latest migrate all
```

Pass `--dry-run` to preview the changes. After `migrate`, `--delete` removes the v1 files nothing imports anymore. Documentation: https://animate-ui.com
