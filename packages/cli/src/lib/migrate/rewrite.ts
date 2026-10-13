import { parse } from '@babel/parser';
import type * as t from '@babel/types';

import { PACKAGE } from '../primitives';
import type { MigrateProject, V1Module } from './project';
import {
  HEADLESS_PRIMITIVES,
  PRIMITIVES,
  UNSUPPORTED_PRIMITIVES,
  UNSUPPORTED_UTILITIES,
  UTILITIES,
  type Migration,
} from './table';

export type ManualStep = {
  line: number;
  migratedLine: number;
  message: string;
  offset: number;
};

export type ImportChange = {
  line: number;
  from: string;
  to: string[];
  names: string[];
};

export type RewriteResult = {
  code: string;
  imports: ImportChange[];
  changes: string[];
  manual: ManualStep[];
  found: string[];
};

export type RewriteContext = {
  project: Pick<MigrateProject, 'resolve' | 'classify'>;
  file: string;
  selected: (module: V1Module) => boolean;
};

type Edit = { start: number; end: number; text: string };

const MOTION_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'layout',
  'layoutId',
  'layoutDependency',
  'layoutScroll',
  'layoutRoot',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragSnapToOrigin',
  'dragControls',
  'dragListener',
  'dragPropagation',
  'dragTransition',
  'dragDirectionLock',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'onHoverStart',
  'onHoverEnd',
  'onTap',
  'onTapStart',
  'onTapCancel',
  'onPan',
  'onPanStart',
  'onPanEnd',
  'onViewportEnter',
  'onViewportLeave',
  'viewport',
  'custom',
  'inherit',
  'transformTemplate',
]);

export function moduleKey(module: V1Module) {
  return module.kind === 'primitive'
    ? `${module.library}/${module.name}`
    : module.id;
}

export function findMigration(module: V1Module): Migration | undefined {
  return module.kind === 'primitive'
    ? PRIMITIVES[moduleKey(module)]
    : UTILITIES[module.id];
}

function isV1Export(name: string, migration: Migration) {
  return (
    name in migration.values ||
    name in migration.types ||
    migration.unmapped.includes(name)
  );
}

function unmappedMessage(
  name: string,
  migration: Migration,
  parentMigrated: boolean,
) {
  const to = `${PACKAGE}/${migration.module}`;
  if (/(Header|Footer)(Props)?$/.test(name))
    return `\`${name}\` has no v2 equivalent (a plain <div> in v1): replace it with a <div> to drop the v1 file.`;
  if (/Shortcut(Props)?$/.test(name))
    return `\`${name}\` has no v2 equivalent (a plain <span> in v1): replace it with a <span> to drop the v1 file.`;
  if (/^use[A-Z]/.test(name))
    return parentMigrated
      ? `\`${name}\` is a v1 context hook, left on v1: its v1 parent is now v2, so it throws at runtime. Remove it: read the part's data attributes (data-state…) or control the state yourself, or replace the component with shadcn/ui's + \`animate-ui animate\`.`
      : `\`${name}\` is a v1 context hook: v2 parts keep the library's API and don't share it. It throws once its v1 parent is migrated: read the part's data attributes (data-state…) or control the state yourself.`;
  if (/ContextType$/.test(name))
    return `\`${name}\` is a v1 context type with no v2 equivalent: remove it.`;
  if (/^[A-Z]/.test(name) && !/Props$|Type$|Direction$|Position$/.test(name))
    return parentMigrated
      ? `\`${name}\` is a v1-only part with no equivalent in ${to}, left on v1: its v1 parent is now v2, so it throws at runtime. Remove it (v2 parts animate themselves; style their data-state attributes or control the state yourself), or replace the component with shadcn/ui's + \`animate-ui animate\`.`
      : `\`${name}\` is a v1-only part with no equivalent in ${to}: remove it (v2 parts animate themselves), or keep the v1 component and replace it with shadcn/ui's + \`animate-ui animate\`.`;
  return `\`${name}\` has no equivalent in ${to}: remove it or define it yourself.`;
}

type ParsedTarget = {
  module: string;
  head: string;
  rest: string[];
  componentProps: boolean;
  extra?: string;
};

function parseTarget(target: string, migration: Migration): ParsedTarget {
  const at = target.indexOf(' & ');
  const [ref0, extra] =
    at < 0 ? [target, undefined] : [target.slice(0, at), target.slice(at + 3)];
  const [module, ref] = ref0.includes('#')
    ? (ref0.split('#') as [string, string])
    : [migration.module, ref0];
  const props = ref.match(/^ComponentProps<(.+)>$/);
  const path = props ? props[1]! : ref;
  const [head, ...rest] = path.split('.');
  return { module, head: head!, rest, componentProps: Boolean(props), extra };
}

function needsDeclaration(target: ParsedTarget) {
  return (
    target.rest.length > 0 || target.componentProps || Boolean(target.extra)
  );
}

function isLibraryModule(migration: Migration) {
  return /^primitives\/(radix-ui|base-ui)\//.test(migration.module);
}

function walk(
  node: t.Node,
  visit: (node: t.Node, parent: t.Node | undefined) => void,
  parent?: t.Node,
) {
  visit(node, parent);
  for (const key of Object.keys(node) as (keyof t.Node)[]) {
    if (
      key === 'loc' ||
      key === 'leadingComments' ||
      key === 'trailingComments' ||
      key === 'innerComments'
    )
      continue;
    const value = node[key] as unknown;
    if (Array.isArray(value)) {
      for (const child of value)
        if (child && typeof child.type === 'string') walk(child, visit, node);
    } else if (
      value &&
      typeof value === 'object' &&
      typeof (value as t.Node).type === 'string'
    ) {
      walk(value as t.Node, visit, node);
    }
  }
}

function importedName(specifier: t.ImportSpecifier | t.ExportSpecifier) {
  const name =
    specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.local;
  return name.type === 'Identifier' ? name.name : name.value;
}

function exportedName(specifier: t.ExportSpecifier) {
  return specifier.exported.type === 'Identifier'
    ? specifier.exported.name
    : specifier.exported.value;
}

type NamedSpecifier = {
  head: string;
  local: string;
  type: boolean;
};

type Declaration = {
  local: string;
  type: boolean;
  target: ParsedTarget;
};

type Plan = {
  node: t.ImportDeclaration | t.ExportNamedDeclaration;
  source: string;
  migration: Migration;
  named: Map<string, NamedSpecifier[]>;
  kept: string[];
  keptDefault?: string;
  declarations: Declaration[];
  names: string[];
};

export function rewrite(code: string, context: RewriteContext): RewriteResult {
  const { project, file, selected } = context;
  const typescriptOnly = /\.[cm]?ts$/.test(file);
  const ast = parse(code, {
    sourceType: 'module',
    plugins: typescriptOnly ? ['typescript'] : ['typescript', 'jsx'],
  });

  const result: RewriteResult = {
    code,
    imports: [],
    changes: [],
    manual: [],
    found: [],
  };
  const hints = new Map<ManualStep, string>();
  const manual = (node: t.Node, message: string, name?: string) => {
    const line = node.loc?.start.line ?? 0;
    const step = { line, migratedLine: line, message, offset: node.start ?? 0 };
    result.manual.push(step);
    if (name) hints.set(step, name);
  };
  const found = new Set<string>();

  const taken = new Set<string>();
  walk(ast.program, (node) => {
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier')
      taken.add(node.name);
  });
  const freeName = (candidates: string[]) => {
    for (const candidate of candidates) {
      if (!taken.has(candidate)) {
        taken.add(candidate);
        return candidate;
      }
    }
    for (let i = 2; ; i++) {
      const candidate = `${candidates[0]}${i}`;
      if (!taken.has(candidate)) {
        taken.add(candidate);
        return candidate;
      }
    }
  };

  const migrationOf = (source: string) => {
    const target = project.resolve(file, source);
    const module = target === undefined ? undefined : project.classify(target);
    if (!module || !selected(module)) return undefined;
    return module;
  };

  const migrationFor = (module: V1Module, node: t.Node) => {
    const key = moduleKey(module);
    if (module.kind === 'primitive' && module.library === 'headless') {
      found.add(key);
      const name = HEADLESS_PRIMITIVES.includes(module.name)
        ? module.name
        : undefined;
      manual(
        node,
        `Headless UI isn't supported in v2: rebuild ${name ? `the ${name}` : 'this'} on Base UI (${PACKAGE}/primitives/base-ui/…) or React Aria (${PACKAGE}/primitives/react-aria). The v1 file keeps working meanwhile.`,
      );
      return undefined;
    }
    if (
      UNSUPPORTED_PRIMITIVES.includes(key) ||
      UNSUPPORTED_UTILITIES.includes(key)
    ) {
      found.add(key);
      manual(
        node,
        `${key} has no v2 equivalent: it keeps importing from the v1 file, which stays yours.`,
      );
      return undefined;
    }
    const migration = findMigration(module);
    if (migration) found.add(key);
    return migration;
  };

  const plans: Plan[] = [];
  const parts = new Map<string, { name: string; plan: Plan }>();
  const unmapped: {
    node: t.Node;
    name: string;
    local?: string;
    migration: Migration;
    key: string;
  }[] = [];
  const migratedModules = new Set<string>();

  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      const module = migrationOf(node.source.value);
      if (!module) continue;
      const migration = migrationFor(module, node);
      if (!migration) continue;
      if (
        module.kind === 'utility' &&
        node.specifiers.some(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            !isV1Export(importedName(specifier), migration),
        )
      )
        continue;

      const plan: Plan = {
        node,
        source: node.source.value,
        migration,
        named: new Map(),
        kept: [],
        declarations: [],
        names: [],
      };
      const notes: [t.Node, string, string][] = [];
      for (const specifier of node.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          manual(
            specifier,
            `\`import * as ${specifier.local.name}\` from a v1 module: import the parts you use from ${PACKAGE}/${migration.module} by hand.`,
          );
          continue;
        }
        if (specifier.type === 'ImportDefaultSpecifier') {
          plan.keptDefault = specifier.local.name;
          continue;
        }
        const name = importedName(specifier);
        const local = specifier.local.name;
        const typeSyntax =
          node.importKind === 'type' || specifier.importKind === 'type';
        const valueTarget = migration.values[name];
        const target = valueTarget ?? migration.types[name];
        const keep = () =>
          plan.kept.push(
            `${specifier.importKind === 'type' ? 'type ' : ''}${name === local ? name : `${name} as ${local}`}`,
          );
        if (!target) {
          keep();
          unmapped.push({
            node: specifier,
            name,
            local,
            migration,
            key: moduleKey(module),
          });
          continue;
        }
        const parsed = parseTarget(target, migration);
        const isType = valueTarget === undefined;
        plan.names.push(name);
        if (!needsDeclaration(parsed)) {
          const list = plan.named.get(parsed.module) ?? [];
          list.push({ head: parsed.head, local, type: isType || typeSyntax });
          plan.named.set(parsed.module, list);
        } else {
          plan.declarations.push({ local, type: isType, target: parsed });
        }
        if (!isType) parts.set(local, { name, plan });
        const note = migration.notes?.[name];
        if (note) notes.push([specifier, note, local]);
      }

      if (plan.names.length === 0) continue;
      for (const [specifier, note, local] of notes)
        manual(specifier, note, local);
      plans.push(plan);
      migratedModules.add(moduleKey(module));
      continue;
    }

    if (node.type === 'ExportNamedDeclaration' && node.source) {
      const module = migrationOf(node.source.value);
      if (!module) continue;
      const migration = migrationFor(module, node);
      if (!migration) continue;
      const plan: Plan = {
        node,
        source: node.source.value,
        migration,
        named: new Map(),
        kept: [],
        declarations: [],
        names: [],
      };
      for (const specifier of node.specifiers) {
        if (specifier.type !== 'ExportSpecifier') {
          manual(specifier, 'Re-export from a v1 module: rewrite it by hand.');
          continue;
        }
        const name = importedName(specifier);
        const exported = exportedName(specifier);
        const valueTarget = migration.values[name];
        const target = valueTarget ?? migration.types[name];
        const parsed = target ? parseTarget(target, migration) : undefined;
        if (!parsed || needsDeclaration(parsed)) {
          plan.kept.push(name === exported ? name : `${name} as ${exported}`);
          if (parsed)
            manual(
              specifier,
              `\`${name}\` is \`${target}\` in v2: export it from a declaration of your own (\`${valueTarget === undefined ? 'type' : 'const'} ${exported} = …\`).`,
            );
          else
            unmapped.push({
              node: specifier,
              name,
              migration,
              key: moduleKey(module),
            });
          continue;
        }
        plan.names.push(name);
        const list = plan.named.get(parsed.module) ?? [];
        list.push({
          head: parsed.head,
          local: exported,
          type:
            valueTarget === undefined ||
            node.exportKind === 'type' ||
            specifier.exportKind === 'type',
        });
        plan.named.set(parsed.module, list);
      }
      if (plan.names.length > 0) {
        plans.push(plan);
        migratedModules.add(moduleKey(module));
      }
      continue;
    }

    if (node.type === 'ExportAllDeclaration') {
      const module = migrationOf(node.source.value);
      if (!module) continue;
      const migration = migrationFor(module, node);
      if (migration)
        manual(
          node,
          `\`export * from\` a v1 module: re-export the parts from ${PACKAGE}/${migration.module} by hand (v2 names differ).`,
        );
    }
  }

  for (const { node, name, local, migration, key } of unmapped)
    manual(
      node,
      unmappedMessage(name, migration, migratedModules.has(key)),
      local,
    );

  walk(ast.program, (node) => {
    const source =
      node.type === 'ImportExpression'
        ? node.source
        : node.type === 'CallExpression' && node.callee.type === 'Import'
          ? node.arguments[0]
          : undefined;
    if (source?.type !== 'StringLiteral') return;
    const module = migrationOf(source.value);
    if (module && findMigration(module)) {
      found.add(moduleKey(module));
      manual(node, 'Dynamic import of a v1 module: rewrite it by hand.');
    }
  });

  const edits: Edit[] = [];
  const lineOf = (node: t.Node) => node.loc?.start.line ?? 0;

  walk(ast.program, (node, parent) => {
    if (node.type !== 'JSXOpeningElement' || node.name.type !== 'JSXIdentifier')
      return;
    const part = parts.get(node.name.name);
    if (!part) return;
    const { name, plan } = part;
    const { migration } = plan;
    const rules = migration.props?.[name] ?? {};
    const attributes = node.attributes.filter(
      (attribute): attribute is t.JSXAttribute & { name: t.JSXIdentifier } =>
        attribute.type === 'JSXAttribute' &&
        attribute.name.type === 'JSXIdentifier',
    );
    const wrap = migration.wrap?.[name];
    const moved = new Set(wrap?.move ?? []);

    for (const attribute of attributes) {
      const prop = attribute.name.name;
      if (moved.has(prop)) continue;
      const rule = rules[prop];
      if (rule && 'rename' in rule) {
        edits.push({
          start: attribute.name.start!,
          end: attribute.name.end!,
          text: rule.rename,
        });
        result.changes.push(
          `line ${lineOf(attribute)}: <${node.name.name}> ${prop} → ${rule.rename}`,
        );
      } else if (rule) {
        manual(attribute, `<${node.name.name}> \`${prop}\`: ${rule.manual}`);
      } else if (MOTION_PROPS.has(prop) && isLibraryModule(migration)) {
        manual(
          attribute,
          `<${node.name.name}> \`${prop}\` is a Motion prop: v2 parts aren't motion components (animated parts take \`transition\` and \`exitTransition\`). Drop it, or animate an element of your own inside the part.`,
        );
      }
    }

    for (const [prop, text] of Object.entries(migration.defaults?.[name] ?? {}))
      if (!attributes.some((attribute) => attribute.name.name === prop)) {
        edits.push({
          start: node.name.end!,
          end: node.name.end!,
          text: ` ${text}`,
        });
        result.changes.push(
          `line ${lineOf(node)}: <${node.name.name}> ${text} (v1's default)`,
        );
      }

    if (wrap && parent?.type === 'JSXElement') {
      const wrapper = wrapperLocal(plan, name, wrap.in);
      const removed: [number, number][] = [];
      const movedText = attributes
        .filter((attribute) => moved.has(attribute.name.name))
        .map((attribute) => {
          let start = attribute.start!;
          while (/\s/.test(code[start - 1]!)) start--;
          edits.push({ start, end: attribute.end!, text: '' });
          removed.push([start, attribute.end!]);
          return ` ${code.slice(attribute.start!, attribute.end!)}`;
        })
        .join('');
      const open = `<${wrapper}${movedText}>`;
      const close = `</${wrapper}>`;
      const lineStart = code.lastIndexOf('\n', parent.start! - 1) + 1;
      const indent = code.slice(lineStart, parent.start!);
      if (/^\s*$/.test(indent)) {
        edits.push(
          {
            start: parent.start!,
            end: parent.start!,
            text: `${open}\n${indent}  `,
          },
          { start: parent.end!, end: parent.end!, text: `\n${indent}${close}` },
        );
        for (let i = parent.start!; i < parent.end!; i++) {
          if (code[i] !== '\n') continue;
          const at = i + 1;
          if (removed.some(([start, end]) => start < at && at < end)) continue;
          edits.push({ start: at, end: at, text: '  ' });
        }
      } else {
        edits.push(
          { start: parent.start!, end: parent.start!, text: open },
          { start: parent.end!, end: parent.end!, text: close },
        );
      }
      result.changes.push(
        `line ${lineOf(node)}: <${node.name.name}> wrapped in <${wrapper}> (v1's rendered its own Portal)`,
      );
    }
  });

  function wrapperLocal(plan: Plan, part: string, head: string) {
    const module = plan.migration.module;
    for (const p of plans) {
      const existing = p.named
        .get(module)
        ?.find((specifier) => specifier.head === head && !specifier.type);
      if (existing && p.node.type === 'ImportDeclaration')
        return existing.local;
    }
    const local = freeName([`${part.replace(/[A-Z][a-z]*$/, '')}${head}`]);
    const list = plan.named.get(module) ?? [];
    list.push({ head, local, type: false });
    plan.named.set(module, list);
    return local;
  }

  if (plans.length === 0) {
    result.manual.sort((a, b) => a.line - b.line || a.offset - b.offset);
    result.found = [...found];
    return result;
  }

  const aliases = new Map<
    string,
    { local: string; type: boolean; plan?: Plan }
  >();
  for (const plan of plans) {
    for (const declaration of plan.declarations) {
      const { module, head } = declaration.target;
      const key = `${module}#${head}`;
      const alias = aliases.get(key);
      if (alias) {
        alias.type &&= declaration.type;
        continue;
      }
      const reused = plans
        .flatMap((p) =>
          p.node.type === 'ImportDeclaration'
            ? (p.named.get(module) ?? [])
            : [],
        )
        .find((specifier) => specifier.head === head && !specifier.type);
      if (reused) {
        aliases.set(key, { local: reused.local, type: false });
        continue;
      }
      const base = declaration.target.componentProps
        ? declaration.local.replace(/Props$/, '')
        : head;
      const local = freeName(
        /^[A-Z]/.test(base)
          ? [
              ...(declaration.target.componentProps || declaration.target.extra
                ? [base]
                : []),
              `${base}Primitive`,
              `Animated${base}`,
            ]
          : [base, `${base}V2`],
      );
      aliases.set(key, { local, type: declaration.type, plan });
    }
  }
  for (const [key, alias] of aliases) {
    if (!alias.plan) continue;
    const [module, head] = key.split('#') as [string, string];
    const list = alias.plan.named.get(module) ?? [];
    list.unshift({ head, local: alias.local, type: alias.type });
    alias.plan.named.set(module, list);
  }

  let componentProps: string | undefined;
  let reactImport: string | undefined;
  if (
    plans.some((plan) => plan.declarations.some((d) => d.target.componentProps))
  ) {
    for (const node of ast.program.body) {
      if (node.type !== 'ImportDeclaration' || node.source.value !== 'react')
        continue;
      for (const specifier of node.specifiers) {
        if (specifier.type !== 'ImportSpecifier')
          componentProps ??= `${specifier.local.name}.ComponentProps`;
        else if (importedName(specifier) === 'ComponentProps')
          componentProps = specifier.local.name;
      }
    }
    if (!componentProps) {
      componentProps = freeName(['ComponentProps', 'ReactComponentProps']);
      reactImport =
        componentProps === 'ComponentProps'
          ? 'ComponentProps'
          : `ComponentProps as ${componentProps}`;
    }
  }

  const declarations: string[] = [];
  for (const [index, plan] of plans.entries()) {
    const { node } = plan;
    const raw = code.slice(node.start!, node.end!);
    const semi = raw.trimEnd().endsWith(';') ? ';' : '';
    const quote = code[node.source!.start!] === '"' ? '"' : "'";
    const keyword = node.type === 'ImportDeclaration' ? 'import' : 'export';
    const statement = (head: string, items: string[], tail: string) => {
      const line = `${head}{ ${items.join(', ')} }${tail}`;
      return line.length <= 80 || items.length === 1
        ? line
        : `${head}{\n${items.map((item) => `  ${item},`).join('\n')}\n}${tail}`;
    };

    const lines: string[] = [];
    if (index === 0 && reactImport)
      lines.push(
        `import type { ${reactImport} } from ${quote}react${quote}${semi}`,
      );
    for (const [module, specifiers] of plan.named) {
      const typeOnly = specifiers.every((specifier) => specifier.type);
      const items = specifiers.map(
        (specifier) =>
          `${specifier.type && !typeOnly ? 'type ' : ''}${specifier.head === specifier.local ? specifier.head : `${specifier.head} as ${specifier.local}`}`,
      );
      lines.push(
        statement(
          `${keyword}${typeOnly ? ' type' : ''} `,
          items,
          ` from ${quote}${PACKAGE}/${module}${quote}${semi}`,
        ),
      );
    }
    if (plan.kept.length > 0 || plan.keptDefault) {
      const typeOnly =
        (node.type === 'ImportDeclaration' && node.importKind === 'type') ||
        (node.type === 'ExportNamedDeclaration' && node.exportKind === 'type');
      const head = `${keyword}${typeOnly ? ' type' : ''} ${plan.keptDefault ? `${plan.keptDefault}${plan.kept.length > 0 ? ', ' : ''}` : ''}`;
      const tail = ` from ${quote}${plan.source}${quote}${semi}`;
      lines.push(
        plan.kept.length > 0
          ? statement(head, plan.kept, tail)
          : `${head.trimEnd()}${tail}`,
      );
    }
    edits.push({ start: node.start!, end: node.end!, text: lines.join('\n') });

    for (const declaration of plan.declarations) {
      const { module, head, rest, extra } = declaration.target;
      const alias = aliases.get(`${module}#${head}`)!.local;
      const path = [alias, ...rest].join('.');
      const value = declaration.target.componentProps
        ? `${componentProps}<typeof ${path}>`
        : path;
      declarations.push(
        `${declaration.type ? 'type' : 'const'} ${declaration.local} = ${value}${extra ? ` & ${extra}` : ''}${semi}`,
      );
    }

    result.imports.push({
      line: lineOf(node),
      from: plan.source,
      to: [...plan.named.keys()].map((module) => `${PACKAGE}/${module}`),
      names: plan.names,
    });
  }

  if (declarations.length > 0) {
    const imports = ast.program.body.filter(
      (node) => node.type === 'ImportDeclaration',
    );
    const last = imports[imports.length - 1]!;
    edits.push({
      start: last.end!,
      end: last.end!,
      text: `\n\n${declarations.join('\n')}`,
    });
  }

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let output = code;
  for (const edit of edits)
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);

  result.code = output;
  for (const step of result.manual) {
    let offset = step.offset;
    for (const edit of edits) {
      if (edit.end <= step.offset)
        offset += edit.text.length - (edit.end - edit.start);
      else if (edit.start < step.offset) {
        const name = hints.get(step);
        const at = name ? edit.text.search(new RegExp(`\\b${name}\\b`)) : -1;
        offset -= step.offset - edit.start - Math.max(at, 0);
      }
    }
    step.migratedLine = output.slice(0, offset).split('\n').length;
  }
  result.manual.sort((a, b) => a.line - b.line || a.offset - b.offset);
  result.found = [...found];
  return result;
}

export function listImports(code: string, file: string) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: /\.[cm]?ts$/.test(file) ? ['typescript'] : ['typescript', 'jsx'],
  });
  const sources: string[] = [];
  walk(ast.program, (node) => {
    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportNamedDeclaration') &&
      node.source
    )
      sources.push(node.source.value);
    const dynamic =
      node.type === 'ImportExpression'
        ? node.source
        : node.type === 'CallExpression' &&
            (node.callee.type === 'Import' ||
              (node.callee.type === 'Identifier' &&
                node.callee.name === 'require'))
          ? node.arguments[0]
          : undefined;
    if (dynamic?.type === 'StringLiteral') sources.push(dynamic.value);
  });
  return sources;
}
