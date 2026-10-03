#!/usr/bin/env bash
# End-to-end check of Animate UI on real shadcn/ui projects:
#   1. create one project per base (shadcn create) with every animatable component,
#   2. install @animate-ui/react from a packed tarball (as published),
#   3. run `animate-ui animate all`,
#   4. typecheck, build, and exercise the components in a browser.
# Needs network access (shadcn registry, npm). Usage: e2e/run.sh [workdir]
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=${1:-$ROOT/e2e/.work}
mkdir -p "$WORK"

pnpm --dir "$ROOT" --filter @animate-ui/react build
pnpm --dir "$ROOT" --filter @animate-ui/cli build
rm -f "$WORK"/animate-ui-react-*.tgz
(cd "$ROOT/packages/react" && pnpm pack --pack-destination "$WORK" >/dev/null)
TARBALL=$(ls "$WORK"/animate-ui-react-*.tgz)
CLI="$ROOT/packages/cli/dist/index.mjs"

COMMON="accordion alert-dialog checkbox collapsible combobox context-menu dialog drawer dropdown-menu hover-card input-otp popover progress radio-group select sheet slider switch tabs toggle toggle-group tooltip button input label"
PORT=4201
for pair in radix:nova:radix-ui base:vega:base-ui aria:maia:react-aria; do
  IFS=: read -r base preset library <<<"$pair"
  dir="$WORK/e2e-$base"
  rm -rf "$dir"
  (cd "$WORK" && pnpm dlx shadcn@latest init -t next -b "$base" -p "$preset" -n "e2e-$base" --no-monorepo -y >/dev/null)
  extra=""
  [ "$base" != aria ] && extra="menubar navigation-menu"
  [ "$base" = base ] && extra="$extra toast"
  (cd "$dir" && pnpm dlx shadcn@latest add $COMMON $extra -y -o >/dev/null)
  (cd "$dir" && npx tsc --noEmit) # the pristine project must compile
  (cd "$dir" && pnpm add "$TARBALL" motion @hugeicons/react @hugeicons/core-free-icons >/dev/null)
  (cd "$dir" && node "$CLI" animate all)
  node "$ROOT/e2e/make-pages.mjs" "$dir" "$library"
  (cd "$dir" && npx tsc --noEmit && pnpm build >/dev/null)
  (cd "$dir" && pnpm start -p "$PORT" >/dev/null 2>&1 &)
  PORT=$((PORT + 1))
done

sleep 5
node "$ROOT/e2e/browser.mjs"
for p in 4201 4202 4203; do lsof -ti "tcp:$p" | xargs kill 2>/dev/null || true; done
