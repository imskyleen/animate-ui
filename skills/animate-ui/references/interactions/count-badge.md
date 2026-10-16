# A badge counting

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: feedback, the number changed. The digits roll with Sliding Number (catalog); the badge bumps when the count grows.

```tsx
'use client';

import * as React from 'react';
import { useAnimate } from 'motion/react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  spring,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function CountBadge({ count }: { count: number }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useShouldReduceMotion();
  const bump = useTempoTransition(spring.bounce);
  const previous = React.useRef(count);

  React.useEffect(() => {
    const grew = count > previous.current;
    previous.current = count;
    if (grew && !reduce) animate(scope.current, { scale: [1.15, 1] }, bump);
  }, [count, reduce, animate, scope, bump]);

  return (
    <span
      ref={scope}
      aria-label={`${count} notifications`}
      className="inline-flex min-w-5 justify-center rounded-full bg-red-500 px-1.5 text-xs text-white"
    >
      <SlidingNumber number={count} />
    </span>
  );
}
```

- Only an increase bumps (from 1.15 on `spring.bounce`); a decrease just rolls the digits.
- `aria-label` carries the count for screen readers; the rolling digits are decoration.
- Under reduced motion there's no bump, and Sliding Number shows the new value at once.
