import { expect, test } from '../test';

test('the markdown exports carry the commands and tables, not JSX', async ({
  request,
}) => {
  const full = await (await request.get('/llms-full.txt')).text();
  const prose = full.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  expect(prose).not.toMatch(
    /<(TypeTable|ComponentPreview|Installation|RegistryInstallation|CodeBlockTabs|Callout|Tabs)\b/,
  );
  expect(full).toContain('npx @animate-ui/cli@latest animate accordion');
  expect(full).toContain('| Prop | Type | Default | Description |');
  expect(full).toContain(
    'npx shadcn@latest add @animate-ui/backgrounds-bubble',
  );
});
