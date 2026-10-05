import * as React from 'react';
import { Progress } from '@/registry/components/radix/progress';

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

  return <Progress value={progress} className="w-[300px]" />;
};
