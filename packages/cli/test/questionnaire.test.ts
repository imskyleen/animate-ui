import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { findPrimitive, primitiveModule } from '../src/lib/primitives';
import { transform } from '../src/lib/transform';

const SHADCN = '@shadcn/react/questionnaire';
const QUESTIONNAIRE = '@animate-ui/react/primitives/questionnaire';
const FIXTURES = path.join(import.meta.dirname, 'fixtures');

test('the questionnaire lives directly under primitives/', () => {
  const primitive = findPrimitive('animate-ui', 'questionnaire');
  expect(primitive).toBeDefined();
  expect(primitiveModule(primitive!)).toBe(QUESTIONNAIRE);
});

for (const library of ['radix-ui', 'base-ui', 'react-aria']) {
  test(`${library} questionnaire, every style: @shadcn/react swapped, classes kept`, () => {
    const files = readdirSync(path.join(FIXTURES, library)).filter((f) =>
      f.startsWith('questionnaire.'),
    );
    expect(files).toHaveLength(8);
    for (const file of files) {
      const input = readFileSync(path.join(FIXTURES, library, file), 'utf8');
      const result = transform(input);
      expect(result.code).toContain(
        `import { Questionnaire as QuestionnairePrimitive } from "${QUESTIONNAIRE}"`,
      );
      expect(result.code).not.toContain(SHADCN);
      expect(result.imports).toEqual([
        { from: SHADCN, to: QUESTIONNAIRE, name: 'questionnaire' },
      ]);
      expect(result.removedClasses).toEqual([]);
      expect(result.code).toContain('transition-colors');
      expect(result.unsupported).toEqual([]);
      expect(result.code).toBe(input.replace(SHADCN, QUESTIONNAIRE));
    }
  });
}

test('the questionnaire import keeps its quotes, semicolons and other specifiers', () => {
  const input = `import { Questionnaire as Q, type QuestionnaireItemDefinition } from '${SHADCN}';\n`;
  const result = transform(input);
  expect(result.code).toBe(
    `import { Questionnaire as Q, type QuestionnaireItemDefinition } from '${QUESTIONNAIRE}';\n`,
  );
  expect(transform(result.code).code).toBe(result.code);
});

test('a type-only questionnaire import is left alone', () => {
  const input = `import type { QuestionnaireItemDefinition } from "${SHADCN}"\n`;
  const result = transform(input);
  expect(result.code).toBe(input);
  expect(result.imports).toEqual([]);
});

test("@shadcn/react's message scroller is left alone, not reported", () => {
  const input = `import { MessageScroller } from "@shadcn/react/message-scroller"\n`;
  const result = transform(input);
  expect(result.code).toBe(input);
  expect(result.imports).toEqual([]);
  expect(result.unsupported).toEqual([]);
});
