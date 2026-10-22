const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
} as const;

let segmenter: Intl.Segmenter | null | undefined;

function splitGraphemes(text: string): string[] {
  if (segmenter === undefined) {
    segmenter =
      typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

type Grapheme = { id: string; label: string };

/** The next text's graphemes, keeping the ids of the ones it shares with the previous text, in order. */
function matchGraphemes(
  previous: readonly Grapheme[],
  labels: readonly string[],
  newId: () => string,
): Grapheme[] {
  const m = previous.length;
  const n = labels.length;
  const common = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      common[i]![j] =
        previous[i]!.label === labels[j]
          ? common[i + 1]![j + 1]! + 1
          : Math.max(common[i + 1]![j]!, common[i]![j + 1]!);
  const kept = new Map<number, Grapheme>();
  for (let i = 0, j = 0; i < m && j < n;) {
    if (previous[i]!.label === labels[j]) kept.set(j++, previous[i++]!);
    else if (common[i + 1]![j]! >= common[i]![j + 1]!) i++;
    else j++;
  }
  return labels.map((label, j) => kept.get(j) ?? { id: newId(), label });
}

/** Each grapheme's advance in the text as the font sets it, kerning included. */
function measureAdvances(mirror: Element, labels: readonly string[]) {
  const node = mirror.firstChild;
  if (!node) return [];
  const range = document.createRange();
  const lefts: number[] = [];
  let offset = 0;
  for (const label of labels) {
    range.setStart(node, offset);
    range.setEnd(node, offset + label.length);
    lefts.push(range.getBoundingClientRect().left);
    offset += label.length;
  }
  range.setStart(node, 0);
  range.setEnd(node, offset);
  const right = range.getBoundingClientRect().right;
  return lefts.map((left, i) => (lefts[i + 1] ?? right) - left);
}

export {
  VISUALLY_HIDDEN,
  splitGraphemes,
  matchGraphemes,
  measureAdvances,
  type Grapheme,
};
