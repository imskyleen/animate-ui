# A field in error

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: feedback, this field needs attention. A short shake, the border turning red, the message read out.

```tsx
'use client';

import * as React from 'react';
import { useAnimate } from 'motion/react';
import {
  shift,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function useShake<T extends HTMLElement>() {
  const [scope, animate] = useAnimate<T>();
  const reduce = useShouldReduceMotion();
  const timing = useTempoTransition(transition.shake);
  const shake = React.useCallback(() => {
    if (reduce || !scope.current) return;
    const s = shift.shake;
    animate(
      scope.current,
      { x: [0, -s, s, -0.66 * s, 0.66 * s, -0.33 * s, 0.33 * s, 0] },
      timing,
    );
  }, [reduce, animate, scope, timing]);
  return [scope, shake] as const;
}

export function EmailField({ error }: { error: string | null }) {
  const [scope, shake] = useShake<HTMLInputElement>();
  React.useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  return (
    <label className="flex flex-col gap-1">
      Email
      <input
        ref={scope}
        type="email"
        aria-invalid={Boolean(error)}
        aria-describedby="email-error"
        className="rounded-md border px-3 py-2 transition-colors aria-invalid:border-red-500"
      />
      <span id="email-error" role="alert" className="text-sm text-red-600">
        {error}
      </span>
    </label>
  );
}
```

- The shake swings `shift.shake` (3px) to each side, then two-thirds, then a third, on `transition.shake` (0.4s): small and quick, never a wobble.
- Shake once per failed submit, not on every keystroke; the color and the message carry the error, the shake only draws the eye.
- The message lives in a `role="alert"` region tied with `aria-describedby`.
- Under reduced motion, no shake: the border and the message are the error.
