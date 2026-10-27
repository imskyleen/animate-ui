import { centerWithMargins, isAnimationClass } from './classes';

export const VUE_PACKAGE = '@animate-ui/vue';
export const VUE_MODULE = `${VUE_PACKAGE}/primitives/reka-ui`;

/** shadcn-vue components Animate UI animates, with the extra classes each one drops. */
const DIALOG_STRIP = [/^duration-(100|200)$/, /^transition$/, /^ease-in-out$/];

export const VUE_PRIMITIVES: Record<string, RegExp[]> = {
  accordion: [],
  'alert-dialog': DIALOG_STRIP,
  carousel: [],
  'code-block': [],
  checkbox: [],
  collapsible: [],
  combobox: [],
  'context-menu': [/^duration-100$/],
  dialog: DIALOG_STRIP,
  'dropdown-menu': [/^duration-100$/],
  drawer: [
    /^transform-\[translate3d\(var\(--drawer-swipe-movement-x/,
    /^transition-transform$/,
    /^duration-500$/,
    /^ease-\[cubic-bezier\(0\.32,0\.72,0,1\)\]$/,
    /^data-swiping:duration-0$/,
  ],
  'hover-card': [/^duration-100$/],
  'input-otp': [],
  menubar: [/^duration-100$/],
  pagination: [],
  'navigation-menu': [
    /^group-data-\[viewport=false\]\/navigation-menu:duration-200$/,
  ],
  popover: [/^duration-100$/],
  progress: [/^transition-all$/],
  select: [/^duration-100$/],
  'radio-group': [],
  sheet: DIALOG_STRIP,
  slider: [],
  switch: [/^transition-transform$/, /^transition-all$/],
  tabs: [],
  toggle: [],
  'toggle-group': [],
  tooltip: [/^duration-100$/],
};

const REKA_IMPORT = /(\bfrom\s+)(["'])reka-ui\2/g;

/** Other packages a shadcn-vue component imports that Animate UI replaces. */
export const VUE_PACKAGES: Record<string, { from: string; to: string }> = {
  carousel: {
    from: 'embla-carousel-vue',
    to: `${VUE_PACKAGE}/primitives/carousel`,
  },
  'input-otp': {
    from: 'vue-input-otp',
    to: `${VUE_PACKAGE}/primitives/input-otp`,
  },
};

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

const CODE_BLOCK_MODULE = `${VUE_PACKAGE}/primitives/code-block`;
const COPY_MODULE = `${VUE_PACKAGE}/primitives/buttons/copy`;

// After a script's last import.
function addImports(code: string, lines: string[]) {
  const imports = [...code.matchAll(/^import .*$/gm)];
  const last = imports[imports.length - 1];
  if (!last) return code;
  const at = last.index! + last[0].length;
  return `${code.slice(0, at)}\n${lines.join('\n')}${code.slice(at)}`;
}

/**
 * shadcn-vue's code block has no primitive import to swap: in
 * `CodeBlockContent.vue` the outer `Primitive as="pre"` becomes the
 * code-block primitive's `Content`, and `CodeBlockCopyButton.vue` is built on
 * the Copy Button. Each file is rewritten only when it has shadcn-vue's shape.
 */
function rewriteCodeBlock(code: string) {
  const rewritten: string[] = [];
  const manual: string[] = [];
  if (code.includes(CODE_BLOCK_MODULE) || code.includes(COPY_MODULE))
    return { code, rewritten, manual };

  if (/data-slot="code-block-content"/.test(code)) {
    const opening = /<Primitive(\s+as="pre"\s+data-slot="code-block-content")/;
    const end = code.lastIndexOf('</template>');
    const closing = code.lastIndexOf('</Primitive>', end);
    if (!opening.test(code) || closing < 0) {
      manual.push('CodeBlockContent');
      return { code, rewritten, manual };
    }
    let out =
      code.slice(0, closing) +
      '</CodeBlockContentPrimitive>' +
      code.slice(closing + '</Primitive>'.length);
    out = out.replace(opening, '<CodeBlockContentPrimitive$1');
    out = addImports(out, [
      `import { Content as CodeBlockContentPrimitive } from "${CODE_BLOCK_MODULE}"`,
    ]);
    rewritten.push('CodeBlockContent: pre → CodeBlockContentPrimitive');
    return { code: out, rewritten, manual };
  }

  if (/data-slot="code-block-copy-button"/.test(code)) {
    const clipboard = /^import \{ useClipboard \} from ["']@vueuse\/core["']\n/m;
    const state = /const \{ copy, copied \} = useClipboard\([^)]*\)/;
    const button =
      /^([ \t]*)<Button\n([\s\S]*?)^[ \t]*data-slot="code-block-copy-button"\n([\s\S]*?)^[ \t]*@click="copy\(props\.value\)"\n([\s\S]*?)^([ \t]*)<(\S[^>]*?) v-if="copied" \/>\n[ \t]*<(\S[^>]*?) v-else \/>\n([ \t]*)<\/Button>/m;
    const match = button.exec(code);
    if (!clipboard.test(code) || !state.test(code) || !match) {
      manual.push('CodeBlockCopyButton');
      return { code, rewritten, manual };
    }
    const [whole, indent, before, between, after, at, copiedIcon, icon] =
      match as unknown as string[];
    const inner = [
      `${indent}<Button`,
      `${before}${between}${after}${at}<CopyButtonIcon>`,
      `${at}  <template #icon>`,
      `${at}    <${icon} />`,
      `${at}  </template>`,
      `${at}  <template #copied-icon>`,
      `${at}    <${copiedIcon} />`,
      `${at}  </template>`,
      `${at}</CopyButtonIcon>`,
      `${indent}</Button>`,
    ]
      .join('\n')
      .replace(/^/gm, '  ');
    const wrapped = [
      `${indent}<CopyButton`,
      `${indent}  as-child`,
      `${indent}  data-slot="code-block-copy-button"`,
      `${indent}  :content="props.value"`,
      `${indent}  :delay="2000"`,
      `${indent}  @copied-change="(value: boolean) => (copied = value)"`,
      `${indent}>`,
      inner,
      `${indent}</CopyButton>`,
    ].join('\n');
    let out = code
      .replace(whole!, wrapped)
      .replace(clipboard, '')
      .replace(state, 'const copied = ref(false)');
    out = addImports(out, [
      `import { CopyButton, CopyButtonIcon } from "${COPY_MODULE}"`,
      'import { ref } from "vue"',
    ]);
    rewritten.push('CodeBlockCopyButton: built on CopyButton');
    return { code: out, rewritten, manual };
  }

  return { code, rewritten, manual };
}

export type VueTransformResult = {
  code: string;
  imports: number;
  packageImports: number;
  removedClasses: string[];
  centering: string[];
  sheetSide: boolean;
  /** Parts rewritten in place (the code block, which has no import to swap). */
  rewritten: string[];
  /** Parts that didn't have the shape to rewrite: their docs list the edits. */
  manual: string[];
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
  const swap = VUE_PACKAGES[component];
  let packageImports = 0;
  const repackaged = swap
    ? swapped.replace(
        new RegExp(`(\\bfrom\\s+)(["'])${swap.from}\\2`, 'g'),
        (_, from: string, quote: string) => {
          packageImports++;
          return `${from}${quote}${swap.to}${quote}`;
        },
      )
    : swapped;
  const block =
    component === 'code-block'
      ? rewriteCodeBlock(repackaged)
      : { code: repackaged, rewritten: [], manual: [] };
  const sided =
    component === 'sheet' ? withSheetSide(block.code) : block.code;
  const { code: stripped, removed } = stripAnimationClasses(sided, extra);
  const { code: centered, centering } =
    options.tailwind === 3
      ? centerClassLists(stripped)
      : { code: stripped, centering: [] };
  return {
    code: centered,
    imports,
    packageImports,
    removedClasses: removed,
    centering,
    sheetSide: component === 'sheet' && sided !== block.code,
    rewritten: block.rewritten,
    manual: block.manual,
  };
}
