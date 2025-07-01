'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { motion } from 'motion/react';

type ShinyTextProps = React.ComponentProps<'div'> & {
  text: string;
};

const ShinyText = ({ text, className, ...props }: ShinyTextProps) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center min-w-2xl min-h-2',
        className,
      )}
      {...props}
    >
      {text}
    </div>
  );
};

export { ShinyText, type ShinyTextProps };
