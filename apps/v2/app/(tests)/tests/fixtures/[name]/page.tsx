import { notFound } from 'next/navigation';

import { fixtures } from '@/tests/fixtures';

// API compatibility fixtures, for Playwright.
export default async function FixtureTestPage({
  params,
}: PageProps<'/tests/fixtures/[name]'>) {
  const { name } = await params;
  const Fixture = fixtures[name];
  if (!Fixture) notFound();

  return (
    <main className="p-10">
      <Fixture />
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(fixtures).map((name) => ({ name }));
}
