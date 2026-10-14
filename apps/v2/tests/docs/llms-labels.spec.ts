import { expect, test } from '@playwright/test';

test('llms.txt names each library as it is written', async ({ request }) => {
  const text = await (await request.get('/llms.txt')).text();
  for (const name of ['Animate UI', 'Base UI', 'Radix UI', 'React Aria'])
    expect(text).toContain(name);
  expect(text).not.toMatch(/Base ui|Radix ui|React aria|Animate ui/);
});
