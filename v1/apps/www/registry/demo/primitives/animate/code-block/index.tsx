'use client';

import { CodeBlock } from '@/registry/primitives/animate/code-block';
import { cn } from '@workspace/ui/lib/utils';
import { useTheme } from 'next-themes';

interface CodeBlockDemoProps {
  duration: number;
  delay: number;
  writing: boolean;
  cursor: boolean;
}

export const CodeBlockDemo = ({
  duration,
  delay,
  writing,
  cursor,
}: CodeBlockDemoProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      key={`${duration}-${delay}-${writing}-${cursor}`}
      className="relative bg-accent w-[420px] h-[372px] text-sm p-4 overflow-auto"
    >
      <CodeBlock
        code={`'use client';
 
import * as React from 'react';
 
type MyComponentProps = {
  myProps: string;
} & React.ComponentProps<'div'>;
 
function MyComponent(props: MyComponentProps) {
  return (
    <div {...props}>
      <p>My Component</p>
    </div>
  );
}

export { MyComponent, type MyComponentProps };`}
        lang="tsx"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        writing={writing}
        duration={duration}
        delay={delay}
        className={cn(
          '[&>pre,_&_code]:!bg-transparent [&>pre,_&_code]:[background:transparent_!important] [&>pre,_&_code]:border-none [&_code]:!text-[13px] [&_code_.line]:!px-0',
          cursor &&
            "data-[done=false]:[&_.line:last-of-type::after]:content-['|'] data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:-translate-px",
        )}
      />
    </div>
  );
};
