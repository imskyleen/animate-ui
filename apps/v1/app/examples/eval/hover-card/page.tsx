'use client';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/evals/hover-card/hover-card';

// Skill evaluation fixture: renders an agent-generated component (tests/eval).
export default function HoverCardEvalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCardTrigger href="#" className="underline">
          Hover me
        </HoverCardTrigger>
        <HoverCardContent>Hover card content</HoverCardContent>
      </HoverCard>
    </main>
  );
}
