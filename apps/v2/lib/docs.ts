import type { LibraryId } from './libraries';
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

function getVueNeighbours(page: Page) {
  const pages = source.getPages().filter((p) => p.slugs[0] === 'vue');
  const intro = pages.filter((p) => !getPrimitive(p));
  const primitives = pages
    .filter((p) => getPrimitive(p))
    .sort((a, b) => a.slugs.at(-1)!.localeCompare(b.slugs.at(-1)!));
  const order = [...intro, ...primitives].map((p) => ({
    name: p.data.title,
    url: p.url,
  }));
  const index = order.findIndex((item) => item.url === page.url);
  if (index === -1) return {};
  return { previous: order[index - 1], next: order[index + 1] };
}

export function getNeighbours(page: Page) {
  if (page.slugs[0] === 'vue') return getVueNeighbours(page);
  const library = getPrimitive(page)?.library;
  type Node = ReturnType<typeof source.getPageTree>['children'][number];
  const isPrimitive = (url: string) => url.startsWith('/docs/primitives/');
  const titles = new Map(source.getPages().map((p) => [p.url, p.data.title]));
  const flatten = (nodes: Node[]): { name: string; url: string }[] =>
    nodes.flatMap((node) => {
      if (node.type === 'page')
        return isPrimitive(node.url)
          ? []
          : [
              {
                name: titles.get(node.url) ?? String(node.name),
                url: node.url,
              },
            ];
      if (node.type === 'folder')
        return [
          ...(node.index && !isPrimitive(node.index.url)
            ? [{ name: String(node.name), url: node.index.url }]
            : []),
          ...flatten(node.children),
        ];
      return [];
    });
  const guide = flatten(source.getPageTree().children);
  const primitives = library
    ? source
        .getPages()
        .filter((p) => getPrimitive(p)?.library === library)
        .sort((a, b) => a.slugs[2]!.localeCompare(b.slugs[2]!))
        .map((p) => ({ name: p.data.title, url: p.url }))
    : [];

  const order = [...guide, ...primitives];
  const index = order.findIndex((item) => item.url === page.url);
  if (index === -1) return {};
  return { previous: order[index - 1], next: order[index + 1] };
}
