import { centerWithMargins, isAnimationClass } from './classes';

export const VUE_PACKAGE = '@animate-ui/vue';
export const VUE_MODULE = `${VUE_PACKAGE}/primitives/reka-ui`;

/** shadcn-vue components Animate UI animates, with the extra classes each one drops. */
const DIALOG_STRIP = [/^duration-(100|200)$/, /^transition$/, /^ease-in-out$/];

export const VUE_PRIMITIVES: Record<string, RegExp[]> = {
  accordion: [],
  'alert-dialog': DIALOG_STRIP,
  checkbox: [],
  collapsible: [],
  'context-menu': [/^duration-100$/],
  dialog: DIALOG_STRIP,
  'dropdown-menu': [/^duration-100$/],
  'hover-card': [/^duration-100$/],
  popover: [/^duration-100$/],
  progress: [/^transition-all$/],
  'radio-group': [],
  sheet: DIALOG_STRIP,
  switch: [/^transition-transform$/, /^transition-all$/],
  toggle: [],
  'toggle-group': [],
  tooltip: [/^duration-100$/],
};

const REKA_IMPORT = /(\bfrom\s+)(["'])reka-ui\2/g;

const TOKEN = /[^\s'"`]+/g;

/** Removes animation classes wherever they're written, keeping the rest of the text as it is. */
function stripAnimationClasses(code: string, extra: RegExp[]) {
  const removed: string[] = [];
  let out = '';
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const token = match[0];
    const start = match.index;
    if (!isAnimationClass(token, extra)) continue;
    removed.push(token);
    let from = start;
    let to = start + token.length;
    while (from > last && /[ \t]/.test(code[from - 1]!)) from--;
    if (from === start || /[\n'"`]/.test(code[from - 1] ?? '\n'))
      while (to < code.length && /[ \t]/.test(code[to]!)) to++;
    out += code.slice(last, from);
    last = to;
  }
  return { code: out + code.slice(last), removed };
}

const QUOTED = /(["'`])([^"'`\n]*?)\1/g;

/** Under Tailwind 3 a translate would fight Motion's transform: center with margins. */
function centerClassLists(code: string) {
  const centering: string[] = [];
  const out = code.replace(QUOTED, (whole, quote: string, value: string) => {
    if (quote === '`' && value.includes('${')) return whole;
    const { value: centered, replaced } = centerWithMargins(value);
    if (replaced.length === 0) return whole;
    centering.push(...replaced);
    return `${quote}${centered}${quote}`;
  });
  return { code: out, centering };
}

/** shadcn-vue's Sheet keeps its side to itself: the content slides from `data-side`. */
function withSheetSide(code: string) {
  if (!/\bside\b/.test(code) || /data-side/.test(code)) return code;
  return code.replace(
    /<DialogContent(?=[\s>])/g,
    '<DialogContent :data-side="side"',
  );
}

export type VueTransformResult = {
  code: string;
  imports: number;
  removedClasses: string[];
  centering: string[];
  sheetSide: boolean;
};

/** A file of a shadcn-vue component folder: reka-ui imports swapped, CSS animations removed. */
export function transformVue(
  code: string,
  component: string,
  options: { tailwind?: 3 | 4 } = {},
): VueTransformResult | null {
  const extra = VUE_PRIMITIVES[component];
  if (!extra) return null;
  let imports = 0;
  const swapped = code.replace(
    REKA_IMPORT,
    (_, from: string, quote: string) => {
      imports++;
      return `${from}${quote}${VUE_MODULE}${quote}`;
    },
  );
  const sided = component === 'sheet' ? withSheetSide(swapped) : swapped;
  const { code: stripped, removed } = stripAnimationClasses(sided, extra);
  const { code: centered, centering } =
    options.tailwind === 3
      ? centerClassLists(stripped)
      : { code: stripped, centering: [] };
  return {
    code: centered,
    imports,
    removedClasses: removed,
    centering,
    sheetSide: sided !== swapped,
  };
}
