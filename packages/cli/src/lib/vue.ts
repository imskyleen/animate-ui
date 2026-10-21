import { isAnimationClass } from './classes';

export const VUE_PACKAGE = '@animate-ui/vue';
export const VUE_MODULE = `${VUE_PACKAGE}/primitives/reka-ui`;

/** shadcn-vue components Animate UI animates, with the extra classes each one drops. */
export const VUE_PRIMITIVES: Record<string, RegExp[]> = {
  accordion: [],
  checkbox: [],
  collapsible: [],
  progress: [/^transition-all$/],
  switch: [/^transition-transform$/, /^transition-all$/],
  toggle: [],
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

export type VueTransformResult = {
  code: string;
  imports: number;
  removedClasses: string[];
};

/** A file of a shadcn-vue component folder: reka-ui imports swapped, CSS animations removed. */
export function transformVue(
  code: string,
  component: string,
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
  const { code: stripped, removed } = stripAnimationClasses(swapped, extra);
  return { code: stripped, imports, removedClasses: removed };
}
