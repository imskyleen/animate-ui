// Exercises the animated components of the three e2e projects (see run.sh).
// Exits 1 on any failure.
import { createRequire } from 'node:module';
import path from 'node:path';

// Playwright is a dev dependency of the docs app.
const require = createRequire(path.join(import.meta.dirname, '..', 'apps', 'v2', 'package.json'));
const { chromium } = require('@playwright/test');

const PORTS = { radix: 4201, base: 4202, aria: 4203 };

function cumulativeOpacity(selector) {
  let el = document.querySelector(selector);
  let opacity = 1;
  while (el) {
    opacity *= Number(getComputedStyle(el).opacity);
    el = el.parentElement;
  }
  return opacity;
}

const browser = await chromium.launch();
let failed = false;
const report = {};

for (const [base, port] of Object.entries(PORTS)) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`http://localhost:${port}/e2e`, { waitUntil: 'networkidle' });
  const section = (name) => page.locator(`[data-demo="${name}"]`);
  const results = {};

  const check = async (name, fn) => {
    if (!(await section(name).count())) return;
    try {
      await section(name).scrollIntoViewIfNeeded();
      // React Aria learns the pointer modality from moves.
      await page.mouse.move(1, 1);
      await page.mouse.move(2, 2);
      results[name] = await fn();
    } catch (error) {
      failed = true;
      results[name] = `FAIL ${String(error.message).split('\n')[0]}`;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(700);
  };

  // Opening animates: 90ms in, the overlay is still fading in.
  const opensAnimated = (name, role, trigger) =>
    check(name, async () => {
      await trigger();
      await page.waitForTimeout(90);
      const opacity = await page.evaluate(cumulativeOpacity, `[role="${role}"]`);
      await page.getByRole(role).first().waitFor({ timeout: 3000 });
      if (!(opacity > 0 && opacity < 1)) throw new Error(`not animating (opacity ${opacity})`);
      return `opens animated (opacity ${opacity.toFixed(2)} at 90ms)`;
    });

  await opensAnimated('dialog', 'dialog', () => section('dialog').getByRole('button').first().click());
  await opensAnimated('alert-dialog', 'alertdialog', () => section('alert-dialog').getByRole('button').first().click());
  await opensAnimated('dropdown-menu', 'menu', () => section('dropdown-menu').getByRole('button').first().click());
  await opensAnimated('select', 'listbox', () => section('select').locator('button, [role="combobox"]').first().click());
  await check('popover', async () => {
    await section('popover').getByRole('button').first().click();
    await page.getByText('Dimensions').first().waitFor({ timeout: 3000 });
    return 'opens';
  });
  await check('accordion', async () => {
    const trigger = section('accordion').getByRole('button', { name: /return policy/ });
    await trigger.click();
    await page.waitForFunction(
      (el) => el.getAttribute('aria-expanded') === 'true',
      await trigger.elementHandle(),
      { timeout: 3000 },
    );
    return 'expands';
  });
  await check('tabs', async () => {
    const tab = section('tabs').getByRole('tab', { name: 'Analytics' }).first();
    await tab.click();
    await page.waitForFunction(
      (el) => el.getAttribute('aria-selected') === 'true',
      await tab.elementHandle(),
      { timeout: 3000 },
    );
    return 'switches';
  });
  await check('switch', async () => {
    const control = section('switch').getByRole('switch').first();
    const before = await control.isChecked();
    await section('switch').getByText('Airplane mode').click();
    await page.waitForTimeout(300);
    if ((await control.isChecked()) === before) throw new Error('did not toggle');
    return 'toggles';
  });
  await check('checkbox', async () => {
    const control = section('checkbox').getByRole('checkbox', { name: /Accept terms and conditions/ }).first();
    const before = await control.isChecked();
    await section('checkbox').getByText('Accept terms and conditions').first().click();
    await page.waitForTimeout(300);
    if ((await control.isChecked()) === before) throw new Error('did not toggle');
    return 'toggles';
  });
  await check('tooltip', async () => {
    const box = await section('tooltip').getByRole('button').first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    // Base UI's tooltip has no tooltip role: find it by its slot too.
    await page.locator('[role="tooltip"], [data-slot="tooltip-content"]').first().waitFor({ timeout: 3000 });
    return 'shows';
  });
  await check('drawer', async () => {
    await section('drawer').getByRole('button').first().click();
    await page.getByRole('dialog').first().waitFor({ timeout: 3000 });
    return 'opens';
  });

  if (errors.length) failed = true;
  results.consoleErrors = errors.slice(0, 5);
  report[base] = results;
  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
process.exit(failed ? 1 : 0);
