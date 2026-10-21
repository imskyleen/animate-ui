import { VueDemo } from '@/components/docs/vue-demo';

const parse = (value: string) =>
  value === 'true' ? true : value === 'false' ? false : value;

export default async function VueDemoTestPage({
  params,
  searchParams,
}: PageProps<'/tests/vue-demos/[lib]/[name]'>) {
  const { lib, name } = await params;
  const controls = Object.fromEntries(
    Object.entries(await searchParams)
      .filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      )
      .map(([key, value]) => [key, parse(value)]),
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-10">
      <VueDemo name={`${lib}/${name}`} {...controls} />
    </main>
  );
}
