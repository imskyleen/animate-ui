import { expect, test, type Page } from '../test';

import {
  ACTION_SCALE,
  DISCLOSURE,
  EXACT,
  FORM,
  STEP_HEIGHT,
  STEP_IN,
  STEP_OUT,
  SWAP,
  actionIn,
  animating,
  atTempo,
  drawnNow,
  easingOf,
  expectHeightGlide,
  expectMonotonic,
  expectNoJumps,
  expectOnCurve,
  expectRestingOn,
  expectRollPainted,
  expectStep,
  expectTiming,
  firstAnimation,
  gotoQuestionnaire,
  itemFrames,
  itemIn,
  paintedOf,
  pick,
  press,
  pxOf,
  record,
  settle,
  type Drawn,
} from './questionnaire-cases';

const FIXTURES = [
  { name: 'animate-ui', path: '/tests/fixtures/animate-ui-questionnaire' },
  {
    name: 'vue animate-ui',
    path: '/tests/vue-demos/fixtures/animate-ui-questionnaire',
  },
];
const formIn = (id: string) => `[data-testid="${id}"] ${FORM}`;
const COLOR = 'Pick a color';
const EXTRAS = 'Any extras?';
const SIZE = 'Which size?';

const rollDuration = (page: Page, form: string) =>
  page.locator(form).evaluate(
    (root) =>
      new Promise<number>((resolve) => {
        const read = () => {
          const roll = root
            .querySelector('[role="progressbar"] [data-animate-ui-from]')
            ?.getAnimations({ subtree: true })
            .find(
              (a) => (a.effect as KeyframeEffect).pseudoElement === '::after',
            );
          if (roll)
            resolve(
              Number((roll.effect as KeyframeEffect).getTiming().duration),
            );
          else requestAnimationFrame(read);
        };
        read();
      }),
  );

const inlineOf = (
  page: Page,
  form: string,
  selector: string,
  property: string,
) =>
  page
    .locator(form)
    .evaluate(
      (root, { selector, property }) =>
        (selector === ':scope'
          ? (root as HTMLElement)
          : root.querySelector<HTMLElement>(selector)!
        ).style.getPropertyValue(property),
      { selector, property },
    );

for (const fw of FIXTURES) {
  test.describe(`${fw.name} questionnaire`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await gotoQuestionnaire(page, fw.path);
    });

    test('controlled: a change from outside slides like one from inside, without calling onItemChange; Previous calls it', async ({
      page,
    }) => {
      const form = formIn('controlled');
      const calls = page.getByTestId('controlled-calls');
      const on = await record(page, form, { active: EXTRAS }, () =>
        page.getByRole('button', { name: 'Show extras' }).click(),
      );
      expectStep(on, { from: COLOR, to: EXTRAS, way: 1 });
      await expect(calls).toHaveText('');
      for (const f of on.filter((f) => f.t >= 0))
        expect(f.focus, `${Math.round(f.t)}ms`).toBe(`item:${EXTRAS}`);
      await settle(page, form);
      await expectRestingOn(page, form, EXTRAS);

      const back = await record(page, form, { active: COLOR }, () =>
        press(page, form, 'previous'),
      );
      expectStep(back, { from: EXTRAS, to: COLOR, way: -1 });
      await expect(calls).toHaveText('color');
      await settle(page, form);

      const far = await record(page, form, { active: SIZE }, () =>
        page.getByRole('button', { name: 'Show size' }).click(),
      );
      expectStep(far, { from: COLOR, to: SIZE, way: 1 });
      for (const f of far) expect(itemIn(f, EXTRAS)).toBeUndefined();
      await expect(calls).toHaveText('color');
      expectNoJumps(on);
      expectNoJumps(back);
      expectNoJumps(far);
    });

    test('a Progress of its own (render) is left alone: no rolling digits', async ({
      page,
    }) => {
      const form = formIn('custom-progress');
      expect((await drawnNow(page, form)).progress).toMatchObject({
        text: 'Step 1/3',
        valuetext: 'Question 1 of 3',
        counts: false,
      });
      await pick(page, form, 'Red');
      await press(page, form, 'next');
      await expect
        .poll(async () => (await drawnNow(page, form)).progress)
        .toMatchObject({
          text: 'Step 2/3',
          valuetext: 'Question 2 of 3',
          counts: false,
        });
    });

    test('AnimateUIProvider tempo={2}: the question leaves in 300ms, the next comes in over 600ms after it, the height glides over 900ms once it has gone (300ms), the buttons swap in 300ms, the numbers roll twice as long, an error unfolds in 700ms, the colors change in 400ms', async ({
      page,
    }) => {
      const form = formIn('tempo');
      expect(
        await page
          .locator(form)
          .evaluate((el) =>
            getComputedStyle(el).getPropertyValue(
              '--animate-ui-questionnaire-color-duration',
            ),
          ),
      ).toBe('400ms');
      await pick(page, form, 'Red');
      await settle(page, form);
      const before = itemIn(await drawnNow(page, form), COLOR)!.h;
      const roll = rollDuration(page, form);
      const frames = await record(
        page,
        form,
        { active: EXTRAS },
        () => press(page, form, 'next'),
        1500,
      );
      expectStep(frames, {
        from: COLOR,
        to: EXTRAS,
        way: 1,
        out: atTempo(STEP_OUT, 2),
        into: atTempo(STEP_IN, 2),
      });
      await settle(page, form);
      const after = itemIn(await drawnNow(page, form), EXTRAS)!.h;
      expectHeightGlide(frames, {
        to: EXTRAS,
        before,
        after,
        height: atTempo(STEP_HEIGHT, 2),
        delay: atTempo(STEP_OUT, 2).duration,
      });
      expectTiming(
        firstAnimation(frames, (f) => actionIn(f, 'previous'), 'opacity'),
        atTempo(SWAP, 2),
      );
      const base = formIn('reset');
      await pick(page, base, 'Red');
      await settle(page, base);
      const baseRoll = rollDuration(page, base);
      await press(page, base, 'next');
      const rolls = (await roll) / (await baseRoll);
      expect(rolls, 'the roll, against tempo 1').toBeGreaterThan(1.5);
      expect(rolls).toBeLessThanOrEqual(2.05);
      const error = await record(page, form, { invalid: EXTRAS }, () =>
        press(page, form, 'next'),
      );
      expectTiming(
        firstAnimation(
          error,
          (f) => f.errors.find((e) => e.legend === EXTRAS),
          'height',
        ),
        atTempo(DISCLOSURE, 2),
      );
    });

    test('AnimateUIProvider tempo={2}: content added to the next question as its height waits to glide starts the glide again, on its timing paced by the tempo (twice as long)', async ({
      page,
    }) => {
      const follow = async (id: string) => {
        const form = formIn(id);
        await pick(page, form, 'Red');
        await settle(page, form);
        return page.locator(form).evaluate(async (root) => {
          const own = (el: Element) =>
            el.closest('[data-animate-ui-questionnaire]') === root;
          const minHeight = (item: Element) =>
            item
              .getAnimations()
              .filter((a) =>
                (a.effect as KeyframeEffect)
                  .getKeyframes()
                  .some((k) => k.minHeight),
              );
          [
            ...root.querySelectorAll<HTMLElement>(
              '[data-slot="questionnaire-next"]',
            ),
          ]
            .find(own)!
            .click();
          await new Promise(requestAnimationFrame);
          const item = [...root.querySelectorAll('fieldset[data-active]')].find(
            own,
          )!;
          const [glide] = minHeight(item);
          const waiting =
            !!glide &&
            Number(glide.currentTime) <
              Number((glide.effect as KeyframeEffect).getTiming().delay);
          const block = document.createElement('div');
          block.style.height = '60px';
          item.append(block);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          const now = minHeight(item);
          return {
            waiting,
            follows: now.map((a) => ({
              same: a === glide,
              duration: Number(
                (a.effect as KeyframeEffect).getTiming().duration,
              ),
            })),
          };
        });
      };
      const one = await follow('reset');
      const two = await follow('tempo');
      for (const run of [one, two]) {
        expect(run.waiting, 'added as the glide waits').toBe(true);
        expect(run.follows, 'a follow, in place of the glide').toHaveLength(1);
        expect(run.follows[0]!.same).toBe(false);
      }
      // a frame-old glide still waiting got the follow spring instead
      expect(one.follows[0]!.duration).toBeCloseTo(STEP_HEIGHT.duration, 0);
      expect(two.follows[0]!.duration).toBeCloseTo(
        atTempo(STEP_HEIGHT, 2).duration,
        0,
      );
    });

    test("AnimateUIProvider tempo={2}: content added halfway through the height's glide is followed on spring.morph paced by the tempo (twice as long)", async ({
      page,
    }) => {
      const follow = async (id: string) => {
        const form = formIn(id);
        await pick(page, form, 'Red');
        await settle(page, form);
        return page.locator(form).evaluate(async (root) => {
          const own = (el: Element) =>
            el.closest('[data-animate-ui-questionnaire]') === root;
          const minHeight = (item: Element) =>
            item
              .getAnimations()
              .filter((a) =>
                (a.effect as KeyframeEffect)
                  .getKeyframes()
                  .some((k) => k.minHeight),
              );
          [
            ...root.querySelectorAll<HTMLElement>(
              '[data-slot="questionnaire-next"]',
            ),
          ]
            .find(own)!
            .click();
          await new Promise(requestAnimationFrame);
          const item = [...root.querySelectorAll('fieldset[data-active]')].find(
            own,
          )!;
          const progress = () =>
            minHeight(item)[0]?.effect?.getComputedTiming().progress ?? null;
          if (progress() === null) return null;
          while ((progress() ?? 1) < 0.5)
            await new Promise(requestAnimationFrame);
          const glide = minHeight(item)[0];
          const at = item.getBoundingClientRect().height;
          const block = document.createElement('div');
          block.style.height = '60px';
          item.append(block);
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          return {
            at,
            after: item.getBoundingClientRect().height,
            follows: minHeight(item).map((a) => ({
              same: a === glide,
              from: parseFloat(
                String(
                  (a.effect as KeyframeEffect).getKeyframes()[0]!.minHeight,
                ),
              ),
              duration: Number(
                (a.effect as KeyframeEffect).getTiming().duration,
              ),
            })),
          };
        });
      };
      const one = await follow('reset');
      const two = await follow('tempo');
      for (const run of [one!, two!]) {
        expect(run.follows, 'a follow, in place of the glide').toHaveLength(1);
        expect(run.follows[0]!.same).toBe(false);
        expect(Math.abs(run.follows[0]!.from - run.at)).toBeLessThan(6);
        expect(run.after).toBeGreaterThanOrEqual(run.at - 0.5);
      }
      const ratio = two!.follows[0]!.duration / one!.follows[0]!.duration;
      expect(ratio, 'the follow, against tempo 1').toBeGreaterThan(1.6);
      expect(ratio).toBeLessThanOrEqual(2.15);
    });

    test('a reset from the last question: back to the first, sliding back, past the question between (never shown); the answers cleared', async ({
      page,
    }) => {
      const form = formIn('reset');
      await pick(page, form, 'Red');
      await press(page, form, 'next');
      await settle(page, form);
      await press(page, form, 'skip');
      await settle(page, form);
      await pick(page, form, 'Large');
      await settle(page, form);
      const frames = await record(page, form, { active: COLOR }, () =>
        page.locator(form).evaluate((el: HTMLFormElement) => el.reset()),
      );
      expectStep(frames, { from: SIZE, to: COLOR, way: -1 });
      for (const f of frames) expect(itemIn(f, EXTRAS)).toBeUndefined();
      expectNoJumps(frames);
      await settle(page, form);
      await expectRestingOn(page, form, COLOR);
      const drawn = await drawnNow(page, form);
      expect(drawn.choices.find((c) => c.name === 'Red')!.checked).toBe(false);
      expect(
        drawn.actions.filter((a) => a.displayed).map((a) => a.slot),
      ).toEqual(['next']);
      expect(drawn.progress!.text).toBe('Question 1 of 3');
    });

    test("submitted after the steps have slid, back and forth: every answer is in the FormData, the hidden questions' included", async ({
      page,
    }) => {
      const form = formIn('submit');
      await pick(page, form, 'Blue');
      await press(page, form, 'next');
      await pick(page, form, 'Cheese');
      await pick(page, form, 'Garlic');
      await press(page, form, 'next');
      await pick(page, form, 'Large');
      await press(page, form, 'previous');
      await press(page, form, 'previous');
      await settle(page, form);
      await press(page, form, 'next');
      await press(page, form, 'next');
      await settle(page, form);
      await page
        .locator(form)
        .locator('[data-slot="questionnaire-submit"]')
        .click();
      await expect(page.getByTestId('submit-data')).toHaveText(
        JSON.stringify({
          color: ['blue'],
          extras: ['cheese', 'garlic'],
          size: ['large'],
        }),
      );
    });

    test('right to left: going on, the question leaving slides toward the start (the right), the next one comes in from the left', async ({
      page,
    }) => {
      const form = formIn('rtl');
      await pick(page, form, 'Red');
      await settle(page, form);
      const frames = await record(page, form, { active: EXTRAS }, () =>
        press(page, form, 'next'),
      );
      expectStep(frames, { from: COLOR, to: EXTRAS, way: -1 });
      const leaving = frames
        .map((f) => itemIn(f, COLOR))
        .filter((i): i is Drawn['items'][number] => !!i && i.tx !== 0);
      expect(leaving.length).toBeGreaterThan(0);
      for (const i of leaving) expect(i.tx).toBeGreaterThan(0);
      await settle(page, form);
      await expectRestingOn(page, form, EXTRAS);
    });

    test('Submit with an earlier question unanswered: back to it, its error unfolding as it comes in, the question following it in one glide on transition.disclosure (never a glide chasing the error)', async ({
      page,
    }) => {
      const form = formIn('jump-back');
      const before = itemIn(await drawnNow(page, form), SIZE)!.h;
      const frames = await record(
        page,
        form,
        { active: COLOR },
        () => press(page, form, 'submit'),
        1000,
      );
      expectStep(frames, { from: SIZE, to: COLOR, way: -1 });
      const error = (f: Drawn) => f.errors.find((e) => e.legend === COLOR)!;
      for (const f of frames.filter((f) => f.t >= 0))
        expect(error(f), `${Math.round(f.t)}ms`).toMatchObject({
          invalid: true,
          displayed: true,
        });
      const glides = new Map<
        string,
        NonNullable<ReturnType<typeof animating>>
      >();
      for (const p of itemFrames(frames, COLOR, -Infinity)) {
        const glide = animating(p.animations, 'minHeight');
        if (glide) glides.set(JSON.stringify(glide.keyframes), glide);
      }
      expect([...glides.keys()], 'its height glides').toHaveLength(1);
      const [glide] = [...glides.values()];
      expect(glide!.duration).toBeCloseTo(DISCLOSURE.duration, 1);
      expect(glide!.easing).toBe(easingOf(DISCLOSURE));
      expect(glide!.delay, 'its delay: the exit left').toBeGreaterThan(
        STEP_OUT.duration - 40,
      );
      expect(glide!.delay).toBeLessThanOrEqual(STEP_OUT.duration + 1);
      expect(pxOf(glide!.keyframes[0]!.minHeight)).toBeCloseTo(before, 1);
      await settle(page, form);
      const end = await drawnNow(page, form);
      const [item, e] = [itemIn(end, COLOR)!, error(end)];
      const after = item.h;
      expect(after - before, 'questions of different heights').toBeGreaterThan(
        20,
      );
      expect(pxOf(glide!.keyframes.at(-1)!.minHeight)).toBeCloseTo(after, 1);
      expectOnCurve(
        itemFrames(frames, COLOR).map((p) => ({
          time: animating(p.animations, 'minHeight')?.currentTime ?? null,
          value: p.h,
        })),
        DISCLOSURE,
        before,
        after,
        { delay: glide!.delay },
      );
      expect(e).toMatchObject({ displayed: true, o: 1, blur: 0 });
      expect(item.y + item.h).toBeCloseTo(e.y + e.h, 1);
      const focus = frames.filter((f) => f.t >= 0).map((f) => f.focus);
      expect(new Set(focus).size, `the focus: ${[...new Set(focus)]}`).toBe(1);
      expectNoJumps(frames);
    });

    test("a Progress in each question (shadcn/ui's card and dialog): the question leaving keeps its own number until it's hidden; the next one shows its own at once, neither rolling", async ({
      page,
    }) => {
      const form = formIn('progress-in-items');
      await pick(page, form, 'Red');
      await settle(page, form);
      for (const [from, to, at, then, act] of [
        [COLOR, EXTRAS, '1', '2', () => press(page, form, 'next')],
        [EXTRAS, COLOR, '2', '1', () => press(page, form, 'previous')],
      ] as const) {
        const frames = await record(page, form, { active: to }, act);
        expectStep(frames, { from, to, way: from === COLOR ? 1 : -1 });
        const leaving = itemFrames(frames, from);
        expect(leaving.length).toBeGreaterThan(2);
        for (const p of leaving) {
          const when = `${Math.round(p.t)}ms: ${from}`;
          const [current, total] = p.counts;
          expect(current, when).toMatchObject({
            text: then,
            hold: at,
            from: null,
            filled: false,
            after: null,
            rolling: 0,
          });
          expect(current!.before, when).toMatchObject({
            value: at,
            alt: '',
            o: 1,
            ty: 0,
          });
          expect(paintedOf(current!), when).toEqual([at]);
          expect(paintedOf(total!), `${when}: its total`).toEqual(['3']);
        }
        for (const p of itemFrames(frames, to)) {
          const when = `${Math.round(p.t)}ms: ${to}`;
          expect(p.counts[0], when).toMatchObject({
            text: then,
            hold: null,
            from: null,
            filled: true,
            rolling: 0,
          });
        }
        await settle(page, form);
        expect(
          await page
            .locator(form)
            .evaluate(
              (root, legends) =>
                legends.map(
                  (legend) =>
                    [...root.querySelectorAll('fieldset')]
                      .find(
                        (el) =>
                          el.querySelector('legend')?.textContent?.trim() ===
                          legend,
                      )!
                      .querySelector('[data-animate-ui-hold]') !== null,
                ),
              [from, to],
            ),
        ).toEqual([false, false]);
      }
    });

    test("a dimmed button (shadcn/ui's navigation-state, disabled) comes and goes from its own look: Submit in to its 0.5, Next out from its 0.5, never brighter", async ({
      page,
    }) => {
      const form = formIn('navigation-state');
      const section = page.getByTestId('navigation-state');
      expect(actionIn(await drawnNow(page, form), 'next')).toMatchObject({
        displayed: true,
        o: 0.5,
      });
      const frames = await record(page, form, { active: SIZE }, () =>
        section.getByRole('button', { name: 'Go to size' }).click(),
      );
      const after = frames.filter((f) => f.t >= 0);
      for (const slot of ['next', 'submit']) {
        for (const f of after) {
          const a = actionIn(f, slot);
          if (a.displayed)
            expect(
              a.o,
              `${Math.round(f.t)}ms: ${slot}, brighter than its own look`,
            ).toBeLessThanOrEqual(0.5 + 1e-3);
        }
        expect(
          after.some((f) => {
            const a = actionIn(f, slot);
            return a.displayed && a.o > 0.02 && a.o < 0.48;
          }),
          `${slot} seen fading`,
        ).toBe(true);
      }
      const out = firstAnimation(frames, (f) => actionIn(f, 'next'), 'opacity');
      expectTiming(out, SWAP);
      expect(out!.keyframes[0]).toMatchObject({ opacity: '0.5', scale: '1' });
      expect(out!.keyframes.at(-1)).toMatchObject({
        opacity: '0',
        scale: String(ACTION_SCALE),
      });
      const into = firstAnimation(
        frames,
        (f) => actionIn(f, 'submit'),
        'opacity',
      );
      expectTiming(into, SWAP);
      expect(into!.keyframes[0]).toMatchObject({
        opacity: '0',
        scale: String(ACTION_SCALE),
      });
      expect(into!.keyframes.at(-1)).toMatchObject({
        opacity: '0.5',
        scale: '1',
      });
      const submit = after.map((f) => actionIn(f, 'submit'));
      expectMonotonic(
        submit.map((a) => a.o),
        1,
        'submit',
      );
      expect(submit.at(-1)).toMatchObject({ o: 0.5, scale: 1, animations: [] });
      await settle(page, form);
      expect(actionIn(await drawnNow(page, form), 'submit').o).toBe(0.5);
    });

    test("a button turning disabled or enabled as it goes (shadcn/ui's navigation-state, going on and back) leaves from its look as drawn", async ({
      page,
    }) => {
      const form = formIn('navigation-state');
      await pick(page, form, 'Red');
      await expect
        .poll(async () => actionIn(await drawnNow(page, form), 'next').o)
        .toBe(1);
      await settle(page, form);
      for (const [slot, to, act] of [
        ['next', SIZE, () => press(page, form, 'next')],
        ['submit', COLOR, () => press(page, form, 'previous')],
      ] as const) {
        const frames = await record(page, form, { active: to }, act);
        const drawn = actionIn(frames.filter((f) => f.t < 0).at(-1)!, slot).o;
        const out = firstAnimation(frames, (f) => actionIn(f, slot), 'opacity');
        expect(
          Number(out!.keyframes[0]!.opacity),
          `${slot} leaves from its opacity as drawn (${drawn})`,
        ).toBeCloseTo(drawn, 2);
        expectMonotonic(
          frames
            .filter((f) => f.t >= 0 && actionIn(f, slot).displayed)
            .map((f) => actionIn(f, slot).o),
          -1,
          slot,
        );
        await settle(page, form);
      }
    });

    test("its own inline styles (style props) and its parents' inline position are kept: the question, Next, the form and the actions row, after leaving and coming back", async ({
      page,
    }) => {
      const form = formIn('inline-styles');
      const styles = async () => ({
        item: await inlineOf(page, form, 'fieldset', 'width'),
        next: await inlineOf(
          page,
          form,
          '[data-slot="questionnaire-next"]',
          'width',
        ),
        form: await inlineOf(page, form, ':scope', 'position'),
        actions: await inlineOf(
          page,
          form,
          '[data-slot="questionnaire-actions"]',
          'position',
        ),
      });
      const before = await styles();
      expect(before).toEqual({
        item: '400px',
        next: '120px',
        form: 'static',
        actions: 'static',
      });
      await pick(page, form, 'Red');
      await settle(page, form);
      const on = await record(page, form, { active: EXTRAS }, () =>
        press(page, form, 'next'),
      );
      expectStep(on, { from: COLOR, to: EXTRAS, way: 1 });
      await settle(page, form);
      await press(page, form, 'skip');
      await settle(page, form);
      await press(page, form, 'previous');
      await settle(page, form);
      await press(page, form, 'previous');
      await settle(page, form);
      expect((await drawnNow(page, form)).items).toMatchObject([
        { legend: COLOR, position: 'static', o: 1, animations: [] },
      ]);
      expect(await styles()).toEqual(before);
    });

    test('a margin of its own on a question (style={{ marginBottom }}) is kept after it leaves and comes back', async ({
      page,
    }) => {
      const form = formIn('inline-styles');
      const item = () =>
        page
          .locator(form)
          .locator('fieldset')
          .first()
          .evaluate((el) => ({
            width: el.style.width,
            margin: el.style.marginBottom,
            drawn: getComputedStyle(el).marginBottom,
          }));
      const own = { width: '400px', margin: '6px', drawn: '6px' };
      expect(await item()).toEqual(own);
      await pick(page, form, 'Red');
      await press(page, form, 'next');
      await settle(page, form);
      await press(page, form, 'previous');
      await settle(page, form);
      expect(await item()).toEqual(own);
    });

    test('content-box questions (2px border, 14px padding): the question leaving keeps its own width, pinned over the next one', async ({
      page,
    }) => {
      const form = formIn('content-box');
      await pick(page, form, 'Red');
      await settle(page, form);
      const rest = itemIn(await drawnNow(page, form), COLOR)!;
      const frames = await record(page, form, { active: EXTRAS }, () =>
        press(page, form, 'next'),
      );
      expectStep(frames, { from: COLOR, to: EXTRAS, way: 1 });
      for (const p of itemFrames(frames, COLOR))
        expect(
          Math.abs(p.w - rest.w),
          `${Math.round(p.t)}ms: its width, ${rest.w}px at rest`,
        ).toBeLessThan(EXACT);
    });

    test('a question leaving keeps its own height (its border box drawn as it was), whatever the next one is', async ({
      page,
    }) => {
      const form = formIn('content-box');
      await pick(page, form, 'Red');
      await settle(page, form);
      for (const [from, to, act] of [
        [COLOR, EXTRAS, () => press(page, form, 'next')],
        [EXTRAS, COLOR, () => press(page, form, 'previous')],
      ] as const) {
        const rest = itemIn(await drawnNow(page, form), from)!.h;
        const frames = await record(page, form, { active: to }, act);
        const leaving = itemFrames(frames, from);
        expect(leaving.length).toBeGreaterThan(2);
        for (const p of leaving)
          expect(
            Math.abs(p.h - rest),
            `${Math.round(p.t)}ms: ${from} ${p.h}px tall as it leaves, ${rest}px at rest`,
          ).toBeLessThan(EXACT);
        await settle(page, form);
      }
    });

    for (const scale of [1, 0.9])
      test(`at fractions of a pixel (400.39px wide)${scale === 1 ? '' : `, under an ancestor's scale (${scale})`}: the question and the buttons leaving are pinned at their exact boxes`, async ({
        page,
      }) => {
        const form = formIn('fractional');
        if (scale !== 1)
          await page
            .getByTestId('fractional')
            .evaluate((el, scale) => (el.style.scale = String(scale)), scale);
        await pick(page, form, 'Red');
        await settle(page, form);
        const rest = itemIn(await drawnNow(page, form), COLOR)!;
        expect(rest.w % 1, 'a fractional width').not.toBe(0);
        const frames = await record(page, form, { active: EXTRAS }, () =>
          press(page, form, 'next'),
        );
        if (scale === 1)
          expectStep(frames, { from: COLOR, to: EXTRAS, way: 1 });
        const leaving = itemFrames(frames, COLOR);
        expect(leaving.length).toBeGreaterThan(2);
        for (const f of frames.filter((f) => f.t >= 0)) {
          const [left, next] = [itemIn(f, COLOR), itemIn(f, EXTRAS)!];
          if (!left) continue;
          const when = `${Math.round(f.t)}ms`;
          expect(left.position, when).toBe('absolute');
          expect(Math.abs(left.y - next.y), `${when}: its top`).toBeLessThan(
            EXACT,
          );
          expect(
            Math.abs(left.x - left.tx * scale - (next.x - next.tx * scale)),
            `${when}: its left`,
          ).toBeLessThan(EXACT);
          expect(Math.abs(left.w - next.w), `${when}: its width`).toBeLessThan(
            EXACT,
          );
          expect(
            Math.abs(left.w - rest.w),
            `${when}: its width, ${rest.w}px at rest`,
          ).toBeLessThan(EXACT);
        }
        await settle(page, form);
        const before = await drawnNow(page, form);
        const buttons = await record(page, form, { active: SIZE }, () =>
          press(page, form, 'skip'),
        );
        for (const slot of ['skip', 'next']) {
          const was = actionIn(before, slot);
          expect(was.displayed).toBe(true);
          expect(
            [was.x % 1, was.w % 1].some((v) => v !== 0),
            `${slot} at a fraction of a pixel`,
          ).toBe(true);
          const shown = buttons
            .filter((f) => f.t >= 0 && actionIn(f, slot).displayed)
            .map((f) => ({ t: f.t, ...actionIn(f, slot) }));
          expect(shown.length, `${slot} seen leaving`).toBeGreaterThan(2);
          for (const a of shown) {
            const when = `${Math.round(a.t)}ms: ${slot}`;
            expect(
              Math.abs(a.x + a.w / 2 - (was.x + was.w / 2)),
              `${when}: its center`,
            ).toBeLessThan(EXACT);
            expect(
              Math.abs(a.y + a.h / 2 - (was.y + was.h / 2)),
              `${when}: its middle`,
            ).toBeLessThan(EXACT);
            expect(
              Math.abs(a.w / a.scale - was.w),
              `${when}: its width`,
            ).toBeLessThan(EXACT);
          }
        }
      });

    test("shadcn/ui's conditional example: an answer enabling a question rolls the total to it; disabled again, going on passes it, never shown", async ({
      page,
    }) => {
      const form = formIn('conditional');
      const RUNTIME = 'Where should it run?';
      const ENVIRONMENT = 'Which environment?';
      const APPROVAL = 'When to ask?';
      expect((await drawnNow(page, form)).progress!.text).toBe(
        'Question 1 of 2',
      );
      const more = await record(page, form, { checked: 'Cloud' }, () =>
        pick(page, form, 'Cloud'),
      );
      expectRollPainted(more, 1, '2', '3');
      for (const f of more)
        expect(f.progress!.numbers[0]!.from, 'the current number stays').toBe(
          null,
        );
      await settle(page, form);
      expect((await drawnNow(page, form)).progress!.text).toBe(
        'Question 1 of 3',
      );
      const on = await record(page, form, { active: ENVIRONMENT }, () =>
        press(page, form, 'next'),
      );
      expectStep(on, { from: RUNTIME, to: ENVIRONMENT, way: 1 });
      await settle(page, form);
      await press(page, form, 'previous');
      await settle(page, form);
      const fewer = await record(page, form, { checked: 'Local' }, () =>
        pick(page, form, 'Local'),
      );
      expectRollPainted(fewer, 1, '3', '2');
      await settle(page, form);
      const past = await record(page, form, { active: APPROVAL }, () =>
        press(page, form, 'next'),
      );
      expectStep(past, { from: RUNTIME, to: APPROVAL, way: 1 });
      for (const f of past) expect(itemIn(f, ENVIRONMENT)).toBeUndefined();
      expectNoJumps(past);
      await settle(page, form);
      expect((await drawnNow(page, form)).progress!.text).toBe(
        'Question 2 of 2',
      );
    });
  });

  test.describe(`${fw.name} questionnaire, on load`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('defaultItem: resumed on a later question with its answers given, nothing moves as it loads; going back, the answer given rests', async ({
      page,
    }) => {
      const form = formIn('resume');
      await page.addInitScript((form) => {
        const w = window as unknown as {
          __resume: {
            items: unknown[];
            actions: unknown[];
            checks: unknown[];
          }[];
        };
        w.__resume = [];
        const tick = () => {
          const root = document.querySelector(form);
          if (root)
            w.__resume.push({
              items: [...root.querySelectorAll('fieldset')]
                .filter((el) => el.getClientRects().length > 0)
                .map((el) => ({
                  legend: el.querySelector('legend')?.textContent,
                  o: getComputedStyle(el).opacity,
                  animations: el.getAnimations().length,
                })),
              actions: [...root.querySelectorAll('button')]
                .filter((el) => el.getClientRects().length > 0)
                .map((el) => ({
                  slot: el.getAttribute('data-slot'),
                  o: getComputedStyle(el).opacity,
                  scale: getComputedStyle(el).scale,
                  animations: el.getAnimations().length,
                })),
              checks: [
                ...root.querySelectorAll(
                  '[data-checked] [data-slot="questionnaire-choice-indicator-check"]',
                ),
              ]
                .filter((el) => el.getClientRects().length > 0)
                .map((el) => {
                  const shape = el.querySelector('path')!;
                  return {
                    o: getComputedStyle(shape).opacity,
                    dash: getComputedStyle(shape).strokeDasharray,
                  };
                }),
            });
          if (w.__resume.length < 3600) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, form);
      await gotoQuestionnaire(page, fw.path);
      await page.waitForTimeout(400);
      const load = await page.evaluate(
        () =>
          (
            window as unknown as {
              __resume: {
                items: unknown[];
                actions: unknown[];
                checks: unknown[];
              }[];
            }
          ).__resume,
      );
      expect(load.length).toBeGreaterThan(10);
      const mounted = load.findIndex((frame) => frame.actions.length > 0);
      expect(mounted).toBeGreaterThan(-1);
      for (const frame of load.slice(0, mounted))
        expect(frame.actions).toEqual([]);
      for (const [i, frame] of load.entries()) {
        const when = `frame ${i}`;
        expect(frame.items, when).toEqual([
          { legend: EXTRAS, o: '1', animations: 0 },
        ]);
        if (i < mounted && !frame.checks.length) continue;
        expect(frame.checks, `${when}: Olives`).toEqual([
          { o: '1', dash: 'none' },
        ]);
        if (i < mounted) continue;
        expect(frame.actions, when).toEqual(
          [
            'questionnaire-previous',
            'questionnaire-skip',
            'questionnaire-next',
          ].map((slot) => ({ slot, o: '1', scale: 'none', animations: 0 })),
        );
      }
      expect((await drawnNow(page, form)).progress!.text).toBe(
        'Question 2 of 3',
      );

      const frames = await record(page, form, { active: COLOR }, () =>
        press(page, form, 'previous'),
      );
      expectStep(frames, { from: EXTRAS, to: COLOR, way: -1 });
      for (const f of frames.filter((f) => f.t >= 0))
        expect(
          f.choices.find((c) => c.name === 'Green')!.dot,
          `${Math.round(f.t)}ms`,
        ).toEqual({ display: 'block', scale: 1, o: 1 });
    });
  });
}
