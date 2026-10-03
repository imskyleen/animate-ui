import { Click, type ClickVariant } from '@/registry/primitives/effects/click';
import { useRef } from 'react';

interface ClickDemoProps {
  variant: ClickVariant;
  global: boolean;
  duration: number;
  size: number;
}

export default function ClickDemo({
  variant,
  global,
  duration,
  size,
}: ClickDemoProps) {
  const scope = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scope}
      className="absolute inset-0 w-full h-full flex items-center justify-center"
    >
      <Click
        scope={global ? undefined : scope}
        // @ts-expect-error - typescript does not handle this well
        variant={variant}
        color="currentColor"
        size={size}
        duration={duration}
      >
        <p className="text-2xl font-bold italic text-neutral-500 select-none">
          Click here to see the effect
        </p>
      </Click>
    </div>
  );
}
