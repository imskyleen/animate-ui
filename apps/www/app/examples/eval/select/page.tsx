'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/evals/select/select';

// Skill evaluation fixture: renders an agent-generated component (tests/eval).
export default function SelectEvalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Select>
        <SelectTrigger className="w-48" aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    </main>
  );
}
