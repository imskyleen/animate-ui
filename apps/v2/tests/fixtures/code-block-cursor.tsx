'use client';

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from '@/demos/animate-ui/code-block';

// A block caught writing just after a line break: its last line is empty.
export default function CodeBlockCursorFixture() {
  return (
    <CodeBlock className="w-80">
      <CodeBlockContent writing lineNumbers>
        <CodeBlockLine>const a = 1;</CodeBlockLine>
        <CodeBlockLine />
      </CodeBlockContent>
    </CodeBlock>
  );
}
