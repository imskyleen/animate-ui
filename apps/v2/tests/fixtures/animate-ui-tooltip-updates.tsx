'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/react/primitives/tooltip';

export default function AnimateUITooltipUpdatesFixture() {
  const [copied, setCopied] = React.useState(false);
  const [shown, setShown] = React.useState(true);
  const [completions, setCompletions] = React.useState(0);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-start gap-16 p-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setCopied(true)}>Copy link</button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
        </Tooltip>
        {shown && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onKeyDown={(event) => {
                  if (event.key === 'Delete') setShown(false);
                }}
              >
                Removable
              </button>
            </TooltipTrigger>
            <TooltipContent>Removable tip</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Tracked</button>
          </TooltipTrigger>
          <TooltipContent
            onAnimationComplete={() => setCompletions((count) => count + 1)}
          >
            Tracked tip
          </TooltipContent>
        </Tooltip>
        <output data-testid="completions">{completions}</output>
      </div>
    </TooltipProvider>
  );
}
