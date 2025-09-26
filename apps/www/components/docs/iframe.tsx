'use client';

import { cn } from '@workspace/ui/lib/utils';
import { useEffect, useState } from 'react';

export default function Iframe({
  name,
  bigScreen = false,
}: {
  name: string;
  bigScreen?: boolean;
}) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    const origin = window.location.origin;
    setIframeUrl(`${origin}/examples/${name}`);
  }, [name]);

  if (!iframeUrl) return null;

  return (
    <iframe
      src={iframeUrl}
      className={cn('h-[500px] rounded-md', bigScreen && 'w-[1600px]')}
    />
  );
}
