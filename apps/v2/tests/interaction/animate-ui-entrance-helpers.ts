import type { Page } from '../test';

import { FRAMEWORKS, type Framework } from './animate-ui-frameworks';

export type EntranceSample = {
  opacity: number;
  y: number;
  scale: number;
  blur: number;
};

export const open = (
  page: Page,
  slug: string,
  framework: Framework = FRAMEWORKS[0],
) => page.goto(framework.demo(slug), { waitUntil: 'networkidle' });

function read(el: Element): EntranceSample {
  const cs = getComputedStyle(el);
  const m = cs.transform.match(/matrix\(([^)]+)\)/);
  const values = m ? m[1]!.split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  const blur = cs.filter.match(/blur\(([\d.]+)px\)/);
  return {
    opacity: Number(cs.opacity),
    y: values[5]!,
    scale: values[0]!,
    blur: blur ? Number(blur[1]) : 0,
  };
}

export async function replayFirstFrame(page: Page) {
  return page.evaluate(
    async ({ readSource }) => {
      const readFn = new Function(`return ${readSource}`)() as typeof read;
      const replay = [...document.querySelectorAll('button')].find(
        (b) => b.textContent?.trim() === 'Replay',
      )!;
      replay.click();
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      return ['Design', 'Build', 'Ship'].map((label) => {
        const card = [...document.querySelectorAll('div')].find(
          (d) => d.textContent === label && d.children.length === 0,
        )!;
        return readFn(card.parentElement!);
      });
    },
    { readSource: read.toString() },
  );
}

export async function sampleCards(page: Page) {
  return page.evaluate(
    ({ readSource }) => {
      const readFn = new Function(`return ${readSource}`)() as typeof read;
      return ['Design', 'Build', 'Ship'].map((label) => {
        const card = [...document.querySelectorAll('div')].find(
          (d) => d.textContent === label && d.children.length === 0,
        )!;
        return readFn(card.parentElement!);
      });
    },
    { readSource: read.toString() },
  );
}
