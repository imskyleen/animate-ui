import { existsSync } from 'node:fs';
import path from 'node:path';

import { notFound } from 'next/navigation';

// Renders one demo (demos/<lib>/<name>.tsx) alone, for Playwright. The query
// string sets the demo's string controls (`?checkAnimation=pop`).
export default async function DemoTestPage({
  params,
  searchParams,
}: PageProps<'/tests/demos/[lib]/[name]'>) {
  const { lib, name } = await params;
  const file = path.join(process.cwd(), 'demos', lib, `${name}.tsx`);
  if (!existsSync(file)) notFound();
  const { default: Demo } = await import(`@/demos/${lib}/${name}`);
  const controls = Object.fromEntries(
    Object.entries(await searchParams).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-10">
      <Demo {...controls} />
    </main>
  );
}
