# A card that opens into a larger view

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: continuity, the card becomes the view: same image, same title, now larger. Also for a gallery opening an image.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Card = { id: string; title: string; body: string; image: string };

export function ExpandingCards({ cards }: { cards: Card[] }) {
  const [open, setOpen] = React.useState<Card | null>(null);
  const morph = useTempoTransition(spring.dialog);
  const overlay = useTempoTransition(transition.overlay);
  const reveal = useTempoTransition(transition.reveal);
  const swap = useTempoTransition(transition.swap);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <ReducedMotionConfig>
      <ul className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <motion.li
            key={card.id}
            layoutId={`card-${card.id}`}
            transition={morph}
            className="overflow-hidden rounded-2xl border bg-white"
          >
            <button
              type="button"
              onClick={() => setOpen(card)}
              className="w-full text-left"
            >
              <motion.img
                layoutId={`image-${card.id}`}
                transition={morph}
                src={card.image}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <motion.h3
                layoutId={`title-${card.id}`}
                transition={morph}
                className="p-4 font-medium"
              >
                {card.title}
              </motion.h3>
            </button>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: overlay }}
            exit={{ opacity: 0, transition: overlay }}
            onClick={() => setOpen(null)}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            layoutId={`card-${open.id}`}
            transition={morph}
            className="fixed inset-x-0 top-16 z-50 mx-auto w-[min(640px,90vw)] overflow-hidden rounded-2xl border bg-white"
          >
            <motion.img
              layoutId={`image-${open.id}`}
              transition={morph}
              src={open.image}
              alt=""
              className="aspect-video w-full object-cover"
            />
            <motion.h3
              layoutId={`title-${open.id}`}
              transition={morph}
              className="p-4 text-xl font-medium"
            >
              {open.title}
            </motion.h3>
            <motion.p
              className="px-4 pb-6 text-neutral-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: reveal }}
              exit={{ opacity: 0, transition: swap }}
            >
              {open.body}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </ReducedMotionConfig>
  );
}
```

- `layoutId` pairs each part with its larger self (card ↔ panel, image ↔ image, title ↔ title): Motion morphs between them on `spring.dialog`, calm, without overshoot.
- Content that only exists in the large view (the body) fades in on `transition.reveal` after the frame moved, and leaves on `transition.swap` (150ms) so it doesn't stretch with the closing frame.
- The page dims on `transition.overlay`; Escape and a click outside close it. For a real dialog (focus trap, return focus), wrap the panel in a library Dialog and keep the `layoutId` on its content.
- The card and the panel share their background, border and radius: the panel is the card grown, so a card without a background gets the panel's (the project's surface color), or the box pops in mid-morph. Overlay and panel sit above the page (`z-50`, the panel after the overlay), above the grid's moving cards.
- Images keep their aspect ratio in both states (`aspect-video` + `object-cover` on both), or the morph distorts them.
- Under reduced motion, the layout morph is skipped: the view appears and fades its body in.
