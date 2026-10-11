import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// One demo (demos/<lib>/<name>.tsx) alone on the page, as an app would render
// it: the docs show demos that lay out a whole page (a sidebar) in an iframe
// of this (`<ComponentPreview iframe>`), like shadcn/ui's blocks and v1's
// examples.
export default async function ExamplePage({
  params,
}: PageProps<'/examples/[lib]/[name]'>) {
  const { lib, name } = await params;
  const file = path.join(process.cwd(), 'demos', lib, `${name}.tsx`);
  if (!existsSync(file)) notFound();
  const { default: Demo } = await import(`@/demos/${lib}/${name}`);

  return <Demo />;
}
