const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
// After this long without a new character, the writing counts as paused.
const IDLE_AFTER = 450;
// The last characters written fade in over this many characters.
const TRAIL = '4ch';

const LINE = '[data-slot=code-block-line]';
const LINE_TEXT = '[data-slot=code-block-line-content]';

// The cursor at the end of the code, pulsing while the writing pauses, under
// the page's own styles.
const CONTENT_CSS =
  '@layer base{' +
  `[data-slot=code-block-content][data-cursor] ${LINE}:last-child>${LINE_TEXT}:not([data-empty])::after,` +
  '[data-slot=code-block-content][data-cursor] [data-slot=code-block-code]:not(:has([data-slot=code-block-line]))::after{content:"|"}' +
  `[data-slot=code-block-content][data-cursor] ${LINE}:last-child>${LINE_TEXT}[data-empty]::before{content:"|"}` +
  `[data-slot=code-block-content][data-idle] ${LINE}:last-child>${LINE_TEXT}:not([data-empty])::after,` +
  `[data-slot=code-block-content][data-idle] ${LINE}:last-child>${LINE_TEXT}[data-empty]::before,` +
  '[data-slot=code-block-content][data-idle] [data-slot=code-block-code]:not(:has([data-slot=code-block-line]))::after{animation:animate-ui-code-block-pulse 2s cubic-bezier(.4,0,.6,1) infinite}' +
  '@keyframes animate-ui-code-block-pulse{50%{opacity:.5}}' +
  '}';

// The trails still settling, so a shown one isn't cleared under it.
const settling = new WeakSet<HTMLElement>();

// The trail: transparent behind the cursor, opaque again `TRAIL` before it.
function showTrail(el: HTMLElement) {
  settling.delete(el);
  const mask = `linear-gradient(to left, #000 0 1ch, transparent 1ch, #000 calc(1ch + ${TRAIL}))`;
  Object.assign(el.style, {
    maskImage: mask,
    webkitMaskImage: mask,
    maskSize: `calc(100% + 1ch + ${TRAIL}) 100%`,
    webkitMaskSize: `calc(100% + 1ch + ${TRAIL}) 100%`,
    maskRepeat: 'no-repeat',
    webkitMaskRepeat: 'no-repeat',
    maskPosition: 'right center',
    webkitMaskPosition: 'right center',
    // A numbered line's text is a grid item: it ends where its text does.
    width: 'fit-content',
    transition: `mask-position 250ms ${EASE_OUT}, -webkit-mask-position 250ms ${EASE_OUT}`,
  });
}

// Slides the trail out past the end, then lets the mask go.
function settleTrail(el: HTMLElement) {
  if (!el.style.maskImage || settling.has(el)) return;
  settling.add(el);
  const out = `right calc(-1ch - ${TRAIL}) center`;
  el.style.maskPosition = out;
  el.style.webkitMaskPosition = out;
  setTimeout(() => {
    if (!settling.has(el)) return;
    settling.delete(el);
    for (const key of [
      'maskImage',
      'webkitMaskImage',
      'maskSize',
      'webkitMaskSize',
      'maskRepeat',
      'webkitMaskRepeat',
      'maskPosition',
      'webkitMaskPosition',
      'width',
      'transition',
    ] as const)
      el.style[key] = '';
  }, 300);
}

// An empty line holds a newline: the cursor sits on it instead of after it.
function markEmptyLines(pre: HTMLElement) {
  for (const text of pre.querySelectorAll<HTMLElement>(LINE_TEXT)) {
    const empty = !text.textContent || text.textContent === '\n';
    if (empty !== text.hasAttribute('data-empty'))
      text.toggleAttribute('data-empty', empty);
  }
}

type Trail = { last: HTMLElement | null; idle?: ReturnType<typeof setTimeout> };

// While the code is written, the last characters fade in behind the cursor;
// paused, the cursor pulses and the trail settles.
function followWriting(pre: HTMLElement, typing: boolean, trail: Trail) {
  pre.removeAttribute('data-idle');
  clearTimeout(trail.idle);
  markEmptyLines(pre);
  // Set here, once the empty lines are known: before, the cursor would sit
  // past an empty line's newline.
  pre.toggleAttribute('data-cursor', typing);
  const texts = pre.querySelectorAll<HTMLElement>(LINE_TEXT);
  const end = texts[texts.length - 1];
  const last = typing && end && !end.hasAttribute('data-empty') ? end : null;
  if (trail.last && trail.last !== last) settleTrail(trail.last);
  trail.last = last;
  if (last) showTrail(last);
  if (!typing) return;
  trail.idle = setTimeout(() => {
    pre.setAttribute('data-idle', '');
    if (last) settleTrail(last);
  }, IDLE_AFTER);
}

type Layout = { height: number; tops: number[] };

function lineLayout(pre: HTMLElement): Layout {
  return {
    height: pre.getBoundingClientRect().height,
    tops: [...pre.querySelectorAll<HTMLElement>(LINE)].map(
      (line) => line.offsetTop,
    ),
  };
}

// Wrapping on or off: the lines glide to their new place, the block to its
// new height.
function glideLines(pre: HTMLElement, before: Layout) {
  const timing = { duration: 300, easing: EASE_OUT };
  const after = lineLayout(pre);
  if (before.height !== after.height)
    pre.animate(
      { height: [`${before.height}px`, `${after.height}px`] },
      timing,
    );
  pre.querySelectorAll<HTMLElement>(LINE).forEach((line, index) => {
    const from = before.tops[index];
    const to = after.tops[index];
    if (from === undefined || to === undefined || from === to) return;
    line.animate({ translate: [`0 ${from - to}px`, '0 0'] }, timing);
  });
}

export {
  CONTENT_CSS,
  followWriting,
  glideLines,
  lineLayout,
  type Layout,
  type Trail,
};
