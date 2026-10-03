import { notFound } from 'next/navigation';

import { demos } from '@/demos';

// Renders one demo alone, for Playwright.
export default async function DemoTestPage({
  params,
}: PageProps<'/tests/demos/[lib]/[name]'>) {
  const { lib, name } = await params;
  const Demo = demos[`${lib}/${name}`];
  if (!Demo) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center p-10">
      <Demo />
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(demos).map((key) => {
    const [lib, name] = key.split('/') as [string, string];
    return { lib, name };
  });
}
