'use client';

import * as React from 'react';
import { CodeBlock } from '@animate-ui/react/primitives/code-block';

export default function CodeBlockDoneFixture() {
  const [done, setDone] = React.useState(0);

  return (
    <div className="flex flex-col items-start gap-4">
      <output data-testid="done">{done}</output>
      <CodeBlock
        code="const a = 1;"
        lang="tsx"
        inView
        onDone={() => setDone((n) => n + 1)}
      />
    </div>
  );
}
