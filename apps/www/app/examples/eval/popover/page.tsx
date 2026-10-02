'use client';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/evals/popover/popover';

// Skill evaluation fixture: renders an agent-generated component (tests/eval).
export default function PopoverEvalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    </main>
  );
}
