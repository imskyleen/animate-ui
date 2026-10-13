import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ExamplePage({
  params,
}: PageProps<'/examples/[lib]/[name]'>) {
  const { lib, name } = await params;
  const file = path.join(process.cwd(), 'demos', lib, `${name}.tsx`);
  if (!existsSync(file)) notFound();
  const { default: Demo } = await import(`@/demos/${lib}/${name}`);

  return <Demo />;
}
