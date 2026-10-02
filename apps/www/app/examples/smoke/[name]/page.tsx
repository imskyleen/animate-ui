'use client';

import { Suspense, use } from 'react';
import { index } from '@/__registry__';

// Renders a single registry item in isolation for the Playwright smoke suite
// (tests/smoke). Demo props use their default values, as in ComponentPreview.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    if ('value' in obj) return obj.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    for (const key in obj) result[key] = unwrapValues(obj[key]);
    return result;
  }
  return obj;
}

export default function SmokePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const Component = index[name]?.component;

  if (!Component) {
    return <p data-smoke-status="not-found">Not found: {name}</p>;
  }

  const props = Object.values(unwrapValues(Component.demoProps ?? {})).reduce(
    (acc, current) => ({ ...acc, ...current }),
    {},
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Suspense fallback={<span data-smoke-status="loading" />}>
        <div data-smoke-status="rendered" className="contents">
          <Component {...props} />
        </div>
      </Suspense>
    </main>
  );
}
