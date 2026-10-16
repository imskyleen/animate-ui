#!/usr/bin/env node
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const usage = `Usage: node css-timing.mjs <token | spring or tween JSON> [--tempo 1.15] [--property transform]

  node css-timing.mjs spring.press
  node css-timing.mjs transition.menu --property opacity
  node css-timing.mjs '{"type":"spring","visualDuration":0.4,"bounce":0.3}'

Prints the CSS timing (a spring becomes the linear() curve it plays) and a transition line.
Run it from the project: it uses the project's @animate-ui/react.`;

const args = process.argv.slice(2);
const input = args.find(
  (arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'),
);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};
if (!input || args.includes('--help')) {
  console.log(usage);
  process.exit(input ? 0 : 1);
}

const require = createRequire(pathToFileURL(`${process.cwd()}/`));
let motion;
try {
  motion = await import(
    pathToFileURL(require.resolve('@animate-ui/react/utils/motion')).href
  );
} catch (error) {
  const found = (() => {
    try {
      return require.resolve('@animate-ui/react/utils/motion');
    } catch {
      return null;
    }
  })();
  console.error(
    found
      ? `Found ${found} but couldn't load it: ${error instanceof Error ? error.message : error}`
      : "Couldn't find @animate-ui/react from this folder: install it (and motion), then run this from the project's folder. Without it, use the tween tokens' values from references/tokens.md.",
  );
  process.exit(1);
}

const { motionTokens, scaleTransition, toCssTiming } = motion;
let transition;
if (input.trim().startsWith('{')) {
  transition = JSON.parse(input);
} else {
  transition = input
    .split('.')
    .reduce((value, key) => value?.[key], motionTokens);
  if (
    !transition ||
    typeof transition !== 'object' ||
    Array.isArray(transition)
  ) {
    console.error(
      `No transition named ${input}: give a spring.* or transition.* token (ease.* tokens are curves, not transitions). Try spring.press, transition.menu…`,
    );
    process.exit(1);
  }
}

const tempo = Number(option('tempo', '1'));
const paced = tempo === 1 ? transition : scaleTransition(transition, tempo);
const { duration, easing } = toCssTiming(paced);
const property = option('property', 'transform');

console.log(`duration: ${duration}ms`);
console.log(`easing: ${easing}`);
console.log(`transition: ${property} ${duration}ms ${easing};`);
