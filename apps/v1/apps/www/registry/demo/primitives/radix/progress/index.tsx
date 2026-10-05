'use client';

import * as React from 'react';
import {
  Progress,
  ProgressIndicator,
} from '@/registry/primitives/radix/progress';

export const RadixProgressDemo = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 25;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (progress >= 100) setTimeout(() => setProgress(0), 4000);
  }, [progress]);

  return (
    <Progress value={progress} className="w-[300px] h-2 border overflow-hidden">
      <ProgressIndicator className="size-full flex-1 bg-primary" />
    </Progress>
  );
};
