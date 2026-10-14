import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '../test';

const SKILLS = join(__dirname, '../../../../skills');

test('the skills page installs the skill with the skills CLI, in each package manager', async ({
  page,
}) => {
  await page.goto('/docs/skills', { waitUntil: 'networkidle' });
  const install = page
    .locator('#install ~ figure, #install ~ div')
    .filter({ hasText: 'skills add' })
    .first();
  for (const [manager, command] of [
    ['npm', 'npx skills add imskyleen/animate-ui'],
    ['pnpm', 'pnpm dlx skills add imskyleen/animate-ui'],
    ['yarn', 'yarn dlx skills add imskyleen/animate-ui'],
    ['bun', 'bun x skills add imskyleen/animate-ui'],
  ] as const) {
    await install.getByRole('tab', { name: manager, exact: true }).click();
    await expect(
      install.getByRole('tabpanel', { name: manager, exact: true }),
    ).toHaveText(command);
  }
  for (const heading of ["What's Included", 'How It Works', 'Learn More'])
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'skills.sh' }).first(),
  ).toHaveAttribute('href', 'https://skills.sh');
});

test('the repository holds one skill the skills CLI finds: skills/animate-ui', () => {
  expect(readdirSync(SKILLS)).toEqual(['animate-ui']);
  const skill = readFileSync(join(SKILLS, 'animate-ui/SKILL.md'), 'utf8');
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  expect(frontmatter).toMatch(/^name: animate-ui$/m);
  const description = frontmatter.match(/^description: (.+)$/m)?.[1] ?? '';
  expect(description.length).toBeGreaterThan(0);
  expect(description.length).toBeLessThanOrEqual(1024);
});
