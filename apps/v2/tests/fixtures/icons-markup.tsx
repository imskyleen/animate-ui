'use client';

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Bell } from '@/registry/icons/bell';

// Icons turned into SVG strings (map markers, data URLs, emails).
export default function IconsMarkupFixture() {
  const [markup, setMarkup] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    setMarkup([
      renderToStaticMarkup(<Bell />),
      renderToStaticMarkup(<Bell animateOnHover />),
      renderToStaticMarkup(<Bell animation="path" />),
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {markup?.map((html, i) => (
        <pre key={i} data-testid={`markup-${i}`} className="text-xs">
          {html}
        </pre>
      ))}
    </div>
  );
}
