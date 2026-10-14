import type { LibraryId } from './libraries';
import { source } from './source';

type Page = ReturnType<typeof source.getPages>[number];

export function getPrimitive(page: Page) {
  const [section, library, name] = page.slugs;
  if (section !== 'primitives' || !library || !name) return undefined;
  return { library: library as LibraryId, name };
}

export function getPrimitiveUrls(name: string) {
  const urls: Partial<Record<LibraryId, string>> = {};
  for (const page of source.getPages()) {
    const primitive = getPrimitive(page);
    if (primitive?.name === name) urls[primitive.library] = page.url;
  }
  return urls;
}

export function getNeighbours(page: Page) {
  const library = getPrimitive(page)?.library;
  type Node = ReturnType<typeof source.getPageTree>['children'][number];
  const isPrimitive = (url: string) => url.startsWith('/docs/primitives/');
  const flatten = (nodes: Node[]): { name: string; url: string }[] =>
    nodes.flatMap((node) => {
      if (node.type === 'page')
        return isPrimitive(node.url)
          ? []
          : [{ name: String(node.name), url: node.url }];
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
