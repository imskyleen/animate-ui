import type { Metadata } from 'next';

import { VueDemo } from '@/components/docs/vue-demo';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function VueExamplePage({
  params,
}: PageProps<'/examples/vue/[lib]/[name]'>) {
  const { lib, name } = await params;
  return <VueDemo name={`${lib}/${name}`} />;
}
