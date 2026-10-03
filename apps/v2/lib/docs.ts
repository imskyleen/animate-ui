import type { LibraryId } from './libraries';
import { source } from './source';

type Page = ReturnType<typeof source.getPages>[number];

/** `primitives/<library>/<name>` pages. */
export function getPrimitive(page: Page) {
  const [section, library, name] = page.slugs;
  if (section !== 'primitives' || !library || !name) return undefined;
  return { library: library as LibraryId, name };
}

/** The URL of a primitive in each library that has it. */
export function getPrimitiveUrls(name: string) {
  const urls: Partial<Record<LibraryId, string>> = {};
  for (const page of source.getPages()) {
    const primitive = getPrimitive(page);
    if (primitive?.name === name) urls[primitive.library] = page.url;
  }
  return urls;
}

/**
 * Previous and next pages in sidebar order: the guide, then the primitives
 * of the current page's library.
 */
export function getNeighbours(page: Page) {
  const library = getPrimitive(page)?.library;
  const guide = source.getPageTree().children.flatMap((node) => {
    if (node.type === 'page')
      return [{ name: String(node.name), url: node.url }];
    if (node.type === 'folder' && node.index)
      return [{ name: String(node.name), url: node.index.url }];
    return [];
  });
  const primitives = library
    ? source
        .getPages()
        .filter((p) => getPrimitive(p)?.library === library)
        .sort((a, b) => a.slugs[2]!.localeCompare(b.slugs[2]!))
        .map((p) => ({ name: p.data.title, url: p.url }))
    : [];

  const order = [...guide, ...primitives];
  const index = order.findIndex((item) => item.url === page.url);
  return { previous: order[index - 1], next: order[index + 1] };
}
