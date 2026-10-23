// Runs before a package is published (prepublishOnly).
// `agent`: only pnpm swaps `exports` for `publishConfig.exports` (src -> dist);
// npm ships the dev exports, pointing at files the package doesn't contain.
// `dist`: the build is there, and every published export points into it.
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const fail = (message) => {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
};

const step = process.argv[2];
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

if (step === 'agent') {
  const agent = process.env.npm_config_user_agent ?? '';
  if (!agent.startsWith('pnpm/'))
    fail(
      `Publish ${pkg.name} with pnpm (pnpm publish, or pnpm release at the root), not ${agent.split('/')[0] || 'npm'}: ` +
        'npm ignores publishConfig.exports and would ship imports pointing at src/.',
    );
}

if (step === 'dist') {
  if (!existsSync('dist') || readdirSync('dist').length === 0)
    fail(`${pkg.name}: dist/ is empty, the build didn't run.`);
  const targets = (value) =>
    typeof value === 'string'
      ? [value]
      : Object.values(value ?? {}).flatMap(targets);
  for (const target of targets(pkg.publishConfig?.exports))
    if (!target.startsWith('./dist/') && target !== './package.json')
      fail(
        `${pkg.name}: publishConfig.exports points outside dist/ (${target}).`,
      );
}
