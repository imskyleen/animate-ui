import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { findPrimitive, primitiveModule } from '../src/lib/primitives';
import { transform } from '../src/lib/transform';

// shadcn/ui's InputOTP imports input-otp in every base. Animate UI's own
// input-otp replaces the package with the same API: `"input-otp"` maps to
// `primitives/input-otp` (no library folder).
const INPUT_OTP = '@animate-ui/react/primitives/input-otp';
const FIXTURES = path.join(import.meta.dirname, 'fixtures');

test('animate-ui primitives live directly under primitives/', () => {
  const primitive = findPrimitive('animate-ui', 'input-otp');
  expect(primitive).toBeDefined();
  expect(primitiveModule(primitive!)).toBe(INPUT_OTP);
  // The libraries keep their folder.
  expect(primitiveModule({ library: 'radix-ui', name: 'tooltip' })).toBe(
    '@animate-ui/react/primitives/radix-ui/tooltip',
  );
});

for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
  test(`${library} input-otp, every style: input-otp swapped, caret kept`, () => {
    const files = readdirSync(path.join(FIXTURES, library)).filter((f) =>
      f.startsWith('input-otp.'),
    );
    expect(files).toHaveLength(8);
    for (const file of files) {
      const input = readFileSync(path.join(FIXTURES, library, file), 'utf8');
      const result = transform(input);
      expect(result.code).toContain(
        `import { OTPInput, OTPInputContext } from "${INPUT_OTP}"`,
      );
      expect(result.code).not.toContain('from "input-otp"');
      expect(result.imports).toEqual([
        { from: 'input-otp', to: INPUT_OTP, name: 'input-otp' },
      ]);
      // The caret's blink doesn't fight Motion: it stays.
      expect(result.code).toContain('animate-caret-blink');
      expect(result.unsupported).toEqual([]);
    }
  });
}

test('the input-otp import keeps its quotes, semicolons and other specifiers', () => {
  const input = `import { OTPInput, REGEXP_ONLY_DIGITS as DIGITS } from 'input-otp';\n`;
  const result = transform(input);
  expect(result.code).toBe(
    `import { OTPInput, REGEXP_ONLY_DIGITS as DIGITS } from '${INPUT_OTP}';\n`,
  );
  expect(transform(result.code).code).toBe(result.code);
});

test('a type-only input-otp import is left alone', () => {
  const input = `import type { SlotProps } from "input-otp"\n`;
  expect(transform(input).code).toBe(input);
});
