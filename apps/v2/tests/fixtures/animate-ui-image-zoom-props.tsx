'use client';

import * as React from 'react';
import {
  Image,
  ImageZoom,
} from '@animate-ui/react/primitives/effects/image-zoom';

export default function AnimateUIImageZoomPropsFixture() {
  const [log, setLog] = React.useState<string[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);
  const push = (entry: string) => setLog((l) => [...l, entry]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div style={{ width: 200, height: 200 }}>
        <ImageZoom
          ref={ref}
          aria-label="Zoomable"
          zoomOnHover={false}
          onClick={() => push(`click ${ref.current?.tagName}`)}
          onMouseEnter={() => push('enter')}
        >
          <Image src="/apple-touch-icon.png" alt="" />
        </ImageZoom>
      </div>
      <output data-testid="log">{log.join(',')}</output>
    </div>
  );
}
