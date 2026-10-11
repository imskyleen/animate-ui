'use client';

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/react/primitives/tooltip';

const CONTENT = 'rounded-md bg-black px-3 py-1.5 text-xs text-white';

// Animate UI's Tooltip: stacked triggers (the content swaps vertically) and
// an `asChild` content (the swap happens inside the child).
export default function AnimateUITooltipFixture() {
  return (
    <div className="flex gap-40">
      <TooltipProvider>
        <div className="flex w-fit flex-col gap-2">
          {['First', 'Second', 'Third'].map((label) => (
            <Tooltip key={label} side="right">
              <TooltipTrigger asChild>
                <button type="button" className="rounded border px-3 py-1">
                  {label}
                </button>
              </TooltipTrigger>
              <TooltipContent className={CONTENT}>
                <TooltipArrow className="size-2.5 fill-black" />
                <p className="whitespace-nowrap">{label} tip</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <TooltipProvider>
        <div className="flex gap-2 pt-20">
          {['Alpha', 'Beta'].map((label) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <button type="button" className="rounded border px-3 py-1">
                  {label}
                </button>
              </TooltipTrigger>
              <TooltipContent asChild>
                <section data-testid="as-child" className={CONTENT}>
                  <TooltipArrow className="size-2.5 fill-black" />
                  <span className="whitespace-nowrap">{label} as child</span>
                </section>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
