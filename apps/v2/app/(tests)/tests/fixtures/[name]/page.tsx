import { existsSync } from 'node:fs';
import path from 'node:path';

import { notFound } from 'next/navigation';

export default async function FixtureTestPage({
  params,
}: PageProps<'/tests/fixtures/[name]'>) {
  const { name } = await params;
  const file = path.join(process.cwd(), 'tests', 'fixtures', `${name}.tsx`);
  if (!existsSync(file)) notFound();
  const { default: Fixture } = await import(`@/tests/fixtures/${name}`);

  return (
    <main className="p-10">
      <Fixture />
    </main>
  );
}
