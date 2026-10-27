import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';
import { transformVue } from '../src/lib/vue';

const FIXTURES = path.join(import.meta.dirname, 'fixtures-code-block');
const read = (file: string) =>
  readFileSync(path.join(FIXTURES, file), 'utf8');

for (const file of readdirSync(FIXTURES))
  test(`code block ${file}: the pre becomes the primitive's Content, the copy button is built on CopyButton`, async () => {
    const input = read(file);
    const result = transform(input, file);
    expect(result.rewritten).toEqual([
      'CodeBlockContent: pre → CodeBlockPrimitive.Content',
      'CodeBlockCopyButton: built on CopyButton',
    ]);
    expect(result.manual).toEqual([]);
    const code = result.code;
    expect(code).toContain(
      'import * as CodeBlockPrimitive from "@animate-ui/react/primitives/code-block"',
    );
    expect(code).toContain(
      'import { CopyButton, CopyButtonIcon } from "@animate-ui/react/primitives/buttons/copy"',
    );
    expect(code).toContain('<CodeBlockPrimitive.Content');
    expect(code).toContain('</CodeBlockPrimitive.Content>');
    expect(code).toContain(
      'React.ComponentProps<typeof CodeBlockPrimitive.Content>',
    );
    expect(code).not.toMatch(/<pre\b/);
    // The Copy Button copies and times the check out now.
    expect(code).not.toContain('navigator.clipboard');
    expect(code).not.toMatch(/useEffect/);
    expect(code).not.toMatch(/\bonClick\b/);
    expect(code).toMatch(
      /<CopyButton\s+asChild\s+data-slot="code-block-copy-button"\s+content=\{value\}\s+delay=\{2000\}\s+onCopiedChange=\{setCopied\}\s*>/,
    );
    expect(code).not.toMatch(/\n\n\n/);
    // Running it again changes nothing.
    expect(transform(code, file).code).toBe(code);
    await expect(code).toMatchFileSnapshot(
      path.join('__snapshots__', 'code-block', `${file}.out`),
    );
  });

test('the icons the project installed stay: copy as the icon, check as the copied one', () => {
  expect(transform(read('installed.lucide.tsx')).code).toContain(
    '<CopyButtonIcon icon={<CopyIcon />} copiedIcon={<CheckIcon />} />',
  );
  expect(transform(read('installed.hugeicons.tsx')).code).toContain(
    '<CopyButtonIcon icon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />} copiedIcon={<HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />} />',
  );
});

test('a copy button changed by hand is left alone and listed as a manual step', () => {
  const input = read('installed.lucide.tsx').replace(
    /  React\.useEffect\(\(\) => \{[\s\S]*?\}, \[copied\]\)\n/,
    '',
  );
  const result = transform(input);
  expect(result.rewritten).toEqual([
    'CodeBlockContent: pre → CodeBlockPrimitive.Content',
  ]);
  expect(result.manual).toEqual(['CodeBlockCopyButton']);
  expect(result.code).toContain('navigator.clipboard');
  expect(result.code).not.toContain('buttons/copy');
});

test('a file that isn\'t the code block is left alone', () => {
  const input = 'export function Pre() {\n  return <pre data-slot="other">x</pre>\n}\n';
  const result = transform(input, 'x.tsx');
  expect(result.code).toBe(input);
  expect(result.rewritten).toEqual([]);
});

const VUE = path.join(import.meta.dirname, 'fixtures-vue', 'code-block');
const readVue = (file: string) => readFileSync(path.join(VUE, file), 'utf8');

test('shadcn-vue code block: the outer pre becomes the primitive\'s Content, the copy button is built on CopyButton', async () => {
  const content = transformVue(readVue('CodeBlockContent.vue'), 'code-block')!;
  expect(content.rewritten).toEqual([
    'CodeBlockContent: pre → CodeBlockContentPrimitive',
  ]);
  expect(content.code).toContain(
    'import { Content as CodeBlockContentPrimitive } from "@animate-ui/vue/primitives/code-block"',
  );
  expect(content.code).toMatch(
    /<CodeBlockContentPrimitive\s+as="pre"\s+data-slot="code-block-content"/,
  );
  // The inner `code` stays reka-ui's Primitive.
  expect(content.code).toMatch(/<Primitive\s+as="code"/);
  expect(content.code).toMatch(/<\/Primitive>\n\s*<\/CodeBlockContentPrimitive>\n<\/template>/);

  const copy = transformVue(readVue('CodeBlockCopyButton.vue'), 'code-block')!;
  expect(copy.rewritten).toEqual(['CodeBlockCopyButton: built on CopyButton']);
  expect(copy.code).not.toContain('useClipboard');
  expect(copy.code).not.toContain('@click');
  expect(copy.code).toContain('const copied = ref(false)');
  expect(copy.code).toMatch(
    /<CopyButton\s+as-child\s+data-slot="code-block-copy-button"\s+:content="props\.value"\s+:delay="2000"/,
  );
  expect(copy.code).toMatch(
    /<template #icon>\s*<CopyIcon \/>\s*<\/template>\s*<template #copied-icon>\s*<CheckIcon \/>/,
  );
  for (const result of [content, copy]) {
    expect(transformVue(result.code, 'code-block')!.code).toBe(result.code);
    expect(result.manual).toEqual([]);
  }
  await expect(content.code).toMatchFileSnapshot(
    path.join('__snapshots__', 'code-block', 'vue-CodeBlockContent.vue.out'),
  );
  await expect(copy.code).toMatchFileSnapshot(
    path.join('__snapshots__', 'code-block', 'vue-CodeBlockCopyButton.vue.out'),
  );
});

test('shadcn-vue: a copy button changed by hand is left alone and listed as a manual step', () => {
  const input = readVue('CodeBlockCopyButton.vue').replace(
    '@click="copy(props.value)"',
    '@click="copy(props.value); track()"',
  );
  const result = transformVue(input, 'code-block')!;
  expect(result.manual).toEqual(['CodeBlockCopyButton']);
  expect(result.code).toContain('useClipboard');
});
