# End-to-end check

`e2e/run.sh` checks Animate UI the way a user meets it: it creates a real shadcn/ui project per base (Radix UI nova, Base UI vega, React Aria maia) with every animatable component, installs `@animate-ui/react` from a packed tarball, runs `animate-ui animate all`, then typechecks, builds and exercises the components in a browser (they must open animated, with no console error).

```bash
e2e/run.sh            # work dir: e2e/.work
```

It needs network access (shadcn registry and npm) and takes a few minutes. Run it before publishing.
