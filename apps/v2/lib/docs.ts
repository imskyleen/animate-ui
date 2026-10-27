import { LIBRARIES, type LibraryId } from './libraries';
import {
  primitiveSection,
  SECTION_ORDER,
  type PrimitiveSection,
} from './primitive-sections';
import { source } from './source';

type Page = ReturnType<typeof source.getPages>[number];

type Framework = 'react' | 'vue';

export function getPrimitive(page: Page) {
  const framework: Framework = page.slugs[0] === 'vue' ? 'vue' : 'react';
  const [section, library, name] =
    framework === 'vue' ? page.slugs.slice(1) : page.slugs;
  if (section !== 'primitives' || !library || !name) return undefined;
  return { framework, library: library as LibraryId, name };
}

export function getPrimitiveUrls(name: string, framework: Framework = 'react') {
  const urls: Partial<Record<LibraryId, string>> = {};
  for (const page of source.getPages()) {
    const primitive = getPrimitive(page);
    if (primitive?.name === name && primitive.framework === framework)
      urls[primitive.library] = page.url;
  }
  return urls;
}

type TreeNode = ReturnType<typeof source.getPageTree>['children'][number];

/**
 * The pages in the sidebar's order: the guide, the primitives by section and
 * name (each on `library`'s page when it has one, as the sidebar links them),
 * the backgrounds, then the icons.
 */
function sidebarOrder(
  children: TreeNode[],
  docs: string,
  library: LibraryId | undefined,
  extra: string[],
) {
  const guide: string[] = [];
  const backgrounds: string[] = [];
  const icons: string[] = [];
  let primitives: TreeNode[] = [];
  const pagesOf = (folder: TreeNode) =>
    folder.type === 'folder'
      ? folder.children.flatMap((child) =>
          child.type === 'page' ? [child.url] : [],
        )
      : [];
  for (const node of children) {
    if (node.type === 'page') guide.push(node.url);
    if (node.type !== 'folder' || node.root || !node.index) continue;
    guide.push(node.index.url);
    if (node.index.url === `${docs}/primitives`) primitives = node.children;
    if (node.index.url === `${docs}/backgrounds`)
      backgrounds.push(...pagesOf(node));
    if (node.index.url === `${docs}/icons`) icons.push(...pagesOf(node));
  }
  guide.push(...extra);

  const entries = new Map<string, Partial<Record<LibraryId, string>>>();
  for (const folder of primitives)
    for (const url of pagesOf(folder)) {
      const [id, slug] = url.split('/').slice(-2) as [LibraryId, string];
      entries.set(slug, { ...entries.get(slug), [id]: url });
    }
  const sections = new Map<PrimitiveSection, string[]>();
  for (const [slug, urls] of [...entries].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const ids = LIBRARIES.map((l) => l.id).filter((id) => urls[id]);
    const section = primitiveSection(
      slug,
      ids.every((id) => id === 'animate-ui'),
    );
    const url = urls[library!] ?? urls[ids[0]!]!;
    sections.set(section, [...(sections.get(section) ?? []), url]);
  }

  return [
    ...guide,
    ...SECTION_ORDER.flatMap((section) => sections.get(section) ?? []),
    ...backgrounds,
    ...icons,
  ];
}

/** The pages before and after one, in the sidebar's order. */
export function getNeighbours(page: Page) {
  const tree = source.getPageTree();
  const titles = new Map(source.getPages().map((p) => [p.url, p.data.title]));
  const library = getPrimitive(page)?.library;
  let order: string[];
  if (page.slugs[0] === 'vue') {
    const vue = [...tree.children, ...(tree.fallback?.children ?? [])].find(
      (node) =>
        node.type === 'folder' &&
        (node.index?.url ??
          node.children.find((c) => c.type === 'page')?.url) === '/docs/vue',
    );
    if (vue?.type !== 'folder') return {};
    // The Vue sidebar ends its guide with the changelog, shared with React.
    const changelog = titles.has('/docs/changelog') ? ['/docs/changelog'] : [];
    order = [
      ...(vue.index ? [vue.index.url] : []),
      ...sidebarOrder(vue.children, '/docs/vue', library, changelog),
    ];
  } else {
    order = sidebarOrder(tree.children, '/docs', library, []);
  }
  const index = order.indexOf(page.url);
  if (index === -1) return {};
  const link = (url: string | undefined) =>
    url ? { name: titles.get(url) ?? url, url } : undefined;
  return { previous: link(order[index - 1]), next: link(order[index + 1]) };
}
