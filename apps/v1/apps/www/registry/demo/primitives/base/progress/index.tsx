'use client';

import * as React from 'react';
import {
  Progress,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  ProgressIndicator,
} from '@/registry/primitives/base/progress';

export const BaseProgressDemo = () => {
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
    <Progress value={progress} className="w-[300px] space-y-2">
      <div className="flex items-center justify-between gap-1">
        <ProgressLabel className="text-sm font-medium">
          Export data
        </ProgressLabel>
        <span className="text-sm">
          <ProgressValue /> %
        </span>
      </div>
      <ProgressTrack className="w-[300px] h-2 border overflow-hidden">
        <ProgressIndicator className="bg-primary" />
      </ProgressTrack>
    </Progress>
  );
};
