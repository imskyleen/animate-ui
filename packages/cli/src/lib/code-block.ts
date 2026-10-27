import type * as t from '@babel/types';

type Edit = { start: number; end: number; text: string };

export const CODE_BLOCK_MODULE = '@animate-ui/react/primitives/code-block';
export const COPY_MODULE = '@animate-ui/react/primitives/buttons/copy';

export type CodeBlockResult = {
  edits: Edit[];
  rewritten: string[];
  manual: string[];
};

type Node = t.Node & { start?: number | null; end?: number | null };

function walk(node: unknown, visit: (node: Node) => void) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  const candidate = node as Node;
  if (typeof candidate.type !== 'string') return;
  visit(candidate);
  for (const key of Object.keys(candidate)) {
    if (
      key === 'loc' ||
      key === 'leadingComments' ||
      key === 'trailingComments' ||
      key === 'innerComments'
    )
      continue;
    walk((candidate as unknown as Record<string, unknown>)[key], visit);
  }
}

function find<T extends Node>(
  root: unknown,
  test: (node: Node) => node is T,
): T[] {
  const found: T[] = [];
  walk(root, (node) => {
    if (test(node)) found.push(node);
  });
  return found;
}

function functionNamed(program: t.Program, name: string) {
  for (const statement of program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (
      declaration?.type === 'FunctionDeclaration' &&
      declaration.id?.name === name
    )
      return declaration;
  }
  return undefined;
}

function jsxName(name: t.JSXOpeningElement['name']): string {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression')
    return `${jsxName(name.object as t.JSXOpeningElement['name'])}.${name.property.name}`;
  return '';
}

function attribute(element: t.JSXOpeningElement, name: string) {
  return element.attributes.find(
    (attr): attr is t.JSXAttribute =>
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === name,
  );
}

function hasSlot(element: t.JSXElement, slot: string) {
  const value = attribute(element.openingElement, 'data-slot')?.value;
  return value?.type === 'StringLiteral' && value.value === slot;
}

const isJsxElement = (node: Node): node is t.JSXElement =>
  node.type === 'JSXElement';

// The line's indentation before an offset.
function indentAt(code: string, offset: number) {
  const lineStart = code.lastIndexOf('\n', offset - 1) + 1;
  return /^[ \t]*/.exec(code.slice(lineStart))![0];
}

// Removes a node with the space up to the next sibling (or the line it sits on).
function removal(code: string, node: Node): Edit {
  let start = node.start!;
  let end = node.end!;
  const lineStart = code.lastIndexOf('\n', start - 1) + 1;
  if (/^[ \t]*$/.test(code.slice(lineStart, start))) start = lineStart;
  if (code[end] === ',') end++;
  const rest = /^[ \t]*\n/.exec(code.slice(end));
  if (rest && start === lineStart) end += rest[0].length;
  return { start, end, text: '' };
}

// A blank line before a removed statement goes with it.
function removalWithBlank(code: string, node: Node): Edit {
  const edit = removal(code, node);
  if (code.slice(edit.start - 2, edit.start) === '\n\n') edit.start -= 1;
  return edit;
}

// Multi-line JSX moved elsewhere: its lines keep their shape under `indent`.
function reindent(text: string, indent: string) {
  const [first, ...rest] = text.split('\n');
  const widths = rest
    .filter((line) => line.trim())
    .map((line) => /^ */.exec(line)![0].length);
  const min = widths.length ? Math.min(...widths) : 0;
  return [first, ...rest.map((line) => indent + line.slice(min))].join('\n');
}

function applyLocal(code: string, from: number, edits: Edit[]) {
  let out = code;
  for (const edit of [...edits].sort((a, b) => b.start - a.start))
    out =
      out.slice(0, edit.start - from) + edit.text + out.slice(edit.end - from);
  return out;
}

/**
 * shadcn/ui's code block has no primitive import to swap: its `pre` becomes
 * the code-block primitive's `Content`, and its copy button is built on the
 * Copy Button. Each part is rewritten only when it has shadcn/ui's shape.
 */
export function codeBlockEdits(
  code: string,
  program: t.Program,
  quote: string,
  semi: string,
): CodeBlockResult {
  const edits: Edit[] = [];
  const rewritten: string[] = [];
  const manual: string[] = [];

  const imports = program.body.filter(
    (node): node is t.ImportDeclaration => node.type === 'ImportDeclaration',
  );
  if (
    imports.some(
      (node) =>
        node.source.value === CODE_BLOCK_MODULE ||
        node.source.value === COPY_MODULE,
    )
  )
    return { edits, rewritten, manual };

  const needed: string[] = [];

  // CodeBlockContent: its `pre` (and its props' type) becomes the primitive's.
  const content = functionNamed(program, 'CodeBlockContent');
  const pre = content
    ? find(content, isJsxElement).find(
        (element) =>
          jsxName(element.openingElement.name) === 'pre' &&
          hasSlot(element, 'code-block-content'),
      )
    : undefined;
  if (content && pre) {
    const name = 'CodeBlockPrimitive.Content';
    edits.push({
      start: pre.openingElement.name.start!,
      end: pre.openingElement.name.end!,
      text: name,
    });
    if (pre.closingElement)
      edits.push({
        start: pre.closingElement.name.start!,
        end: pre.closingElement.name.end!,
        text: name,
      });
    for (const reference of find(
      content.params[0],
      (node): node is t.TSTypeReference => node.type === 'TSTypeReference',
    )) {
      const param = reference.typeParameters?.params[0];
      if (
        param?.type === 'TSLiteralType' &&
        param.literal.type === 'StringLiteral' &&
        param.literal.value === 'pre'
      )
        edits.push({
          start: reference.typeParameters!.start!,
          end: reference.typeParameters!.end!,
          text: `<typeof ${name}>`,
        });
    }
    needed.push(`import * as CodeBlockPrimitive from ${quote}${CODE_BLOCK_MODULE}${quote}${semi}`);
    rewritten.push('CodeBlockContent: pre → CodeBlockPrimitive.Content');
  } else if (content) {
    manual.push('CodeBlockContent');
  }

  // CodeBlockCopyButton: the Copy Button copies, times the check out and swaps
  // the icons, in place of the hand-written ones.
  const copy = functionNamed(program, 'CodeBlockCopyButton');
  const copyEdits = copy ? copyButtonEdits(code, copy) : undefined;
  if (copyEdits) {
    edits.push(...copyEdits);
    needed.push(
      `import { CopyButton, CopyButtonIcon } from ${quote}${COPY_MODULE}${quote}${semi}`,
    );
    rewritten.push('CodeBlockCopyButton: built on CopyButton');
  } else if (copy) {
    manual.push('CodeBlockCopyButton');
  }

  if (needed.length > 0) {
    const last = imports[imports.length - 1];
    edits.push(
      last
        ? { start: last.end!, end: last.end!, text: `\n${needed.join('\n')}` }
        : { start: 0, end: 0, text: `${needed.join('\n')}\n` },
    );
  }

  return { edits, rewritten, manual };
}

function copyButtonEdits(code: string, copy: t.FunctionDeclaration) {
  const params = copy.params[0];
  if (params?.type !== 'ObjectPattern') return undefined;
  const property = (name: string) =>
    params.properties.find(
      (p): p is t.ObjectProperty =>
        p.type === 'ObjectProperty' &&
        p.key.type === 'Identifier' &&
        p.key.name === name,
    );
  const value = property('value');
  const onClick = property('onClick');

  const statements = copy.body.body;
  const state = statements.find(
    (s): s is t.VariableDeclaration =>
      s.type === 'VariableDeclaration' &&
      /\[\s*copied\s*,\s*setCopied\s*\]\s*=\s*(React\.)?useState/.test(
        code.slice(s.start!, s.end!),
      ),
  );
  const timer = statements.find(
    (s): s is t.ExpressionStatement =>
      s.type === 'ExpressionStatement' &&
      /^(React\.)?useEffect\(/.test(code.slice(s.start!, s.end!)) &&
      /setTimeout/.test(code.slice(s.start!, s.end!)),
  );
  const button = find(copy, isJsxElement).find(
    (element) =>
      jsxName(element.openingElement.name) === 'Button' &&
      hasSlot(element, 'code-block-copy-button'),
  );
  if (!value || !state || !timer || !button) return undefined;

  const opening = button.openingElement;
  const click = attribute(opening, 'onClick');
  const slot = attribute(opening, 'data-slot')!;
  const swap = button.children.find(
    (child): child is t.JSXExpressionContainer =>
      child.type === 'JSXExpressionContainer' &&
      child.expression.type === 'ConditionalExpression' &&
      child.expression.test.type === 'Identifier' &&
      child.expression.test.name === 'copied',
  );
  if (!click || !swap) return undefined;
  const conditional = swap.expression as t.ConditionalExpression;
  const text = (node: Node) => code.slice(node.start!, node.end!);
  const icon = text(conditional.alternate);
  const copiedIcon = text(conditional.consequent);
  const at = indentAt(code, swap.start!);
  const icons =
    icon.includes('\n') || copiedIcon.includes('\n')
      ? [
          '<CopyButtonIcon',
          `${at}  icon={${reindent(icon, `${at}  `)}}`,
          `${at}  copiedIcon={${reindent(copiedIcon, `${at}  `)}}`,
          `${at}/>`,
        ].join('\n')
      : `<CopyButtonIcon icon={${icon}} copiedIcon={${copiedIcon}} />`;

  // The button, its own edits applied, nested one level deeper.
  const indent = indentAt(code, button.start!);
  const inner = applyLocal(code.slice(button.start!, button.end!), button.start!, [
    removal(code, slot),
    removal(code, click),
    {
      start: swap.start!,
      end: swap.end!,
      text: icons,
    },
  ]).replace(/\n/g, '\n  ');

  const edits: Edit[] = [
    removalWithBlank(code, timer),
    {
      start: button.start!,
      end: button.end!,
      text: [
        '<CopyButton',
        `${indent}  asChild`,
        `${indent}  data-slot="code-block-copy-button"`,
        `${indent}  content={${value.value.type === 'Identifier' ? value.value.name : 'value'}}`,
        `${indent}  delay={2000}`,
        `${indent}  onCopiedChange={setCopied}`,
        `${indent}>`,
        `${indent}  ${inner}`,
        `${indent}</CopyButton>`,
      ].join('\n'),
    },
  ];
  // Its click handler is gone: a click passed in lands on the button again.
  if (onClick) edits.push(removal(code, onClick));
  return edits;
}
